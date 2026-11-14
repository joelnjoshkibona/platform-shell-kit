<?php

namespace Tests\Feature\Local;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Native\Mobile\Facades\Share;
use Tests\TestCase;

/** P102 on-the-phone mode: back up to a file, restore from one. */
class BackupsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['local.mode' => 'phone', 'app.name' => 'Example Tasks']);
    }

    public function test_a_backup_round_trips_and_is_shared_from_the_app(): void
    {
        $this->postJson('/api/local/Notes/save', ['record' => ['name' => 'Keep me']])->assertCreated();
        Share::shouldReceive('file')->once();
        $made = $this->postJson('/api/local/backup', ['share' => true])->assertOk()->json('data');
        $this->assertMatchesRegularExpression('/^example-tasks-backup-\d{8}-\d{6}\.json$/', $made['name']);
        $this->assertSame(1, $made['records']);
        $this->assertSame($made['made_at'], $this->getJson('/api/local/sync/state')->json('data.last_backup_at'));

        $file = $this->get($made['url'])->assertOk()->streamedContent();
        $this->postJson('/api/local/Notes/save', ['record' => ['name' => 'Made after the backup']])->assertCreated();

        $this->post('/api/local/restore', ['file' => UploadedFile::fake()->createWithContent('backup.json', $file)], ['Accept' => 'application/json'])->assertOk()->assertJsonPath('data.records', 1);
        $this->assertSame(['Keep me'], array_column($this->getJson('/api/local/Notes/list')->json('data.data'), 'name'));
    }

    public function test_a_file_that_is_not_a_backup_is_refused_and_changes_nothing(): void
    {
        $this->postJson('/api/local/Notes/save', ['record' => ['name' => 'Still here']])->assertCreated();
        $this->post('/api/local/restore', ['file' => UploadedFile::fake()->createWithContent('x.json', '{"hello":1}')], ['Accept' => 'application/json'])->assertStatus(422);
        $this->assertCount(1, $this->getJson('/api/local/Notes/list')->json('data.data'));
        $this->get('/api/local/backup/..%2F..%2F.env')->assertNotFound();
    }

    public function test_backups_are_only_for_on_the_phone_mode(): void
    {
        config(['local.mode' => 'sync']);
        $this->postJson('/api/local/backup')->assertNotFound();
    }
}
