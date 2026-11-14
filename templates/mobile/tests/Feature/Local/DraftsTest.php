<?php

namespace Tests\Feature\Local;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** P58: unfinished forms are kept on the phone, one per key, and forgotten when saved, discarded or signed out. */
class DraftsTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_draft_is_kept_read_replaced_and_forgotten(): void
    {
        $this->assertNull($this->getJson('/api/local/drafts/tasks.new')->assertOk()->json('data'));

        $this->putJson('/api/local/drafts/tasks.new', ['payload' => ['title' => 'Count the shelves', 'notes' => 'Ünï']])->assertOk()->assertJsonPath('data.saved', true);
        $draft = $this->getJson('/api/local/drafts/tasks.new')->assertOk()->json('data');
        $this->assertSame(['title' => 'Count the shelves', 'notes' => 'Ünï'], $draft['payload']);
        $this->assertNotEmpty($draft['saved_at']);

        $this->putJson('/api/local/drafts/tasks.new', ['payload' => ['title' => 'Count them twice']])->assertOk();
        $this->assertSame('Count them twice', $this->getJson('/api/local/drafts/tasks.new')->json('data.payload.title'));
        $this->assertSame(1, DB::table('local_meta')->where('key', 'like', 'draft:%')->count(), 'one row per form');

        $this->deleteJson('/api/local/drafts/tasks.new')->assertOk();
        $this->assertNull($this->getJson('/api/local/drafts/tasks.new')->json('data'));
    }

    public function test_one_form_does_not_see_anothers_draft_and_signing_out_forgets_all_of_them(): void
    {
        $this->putJson('/api/local/drafts/a.new', ['payload' => ['x' => 1]])->assertOk();
        $this->putJson('/api/local/drafts/b.new', ['payload' => ['x' => 2]])->assertOk();
        DB::table('local_meta')->insert(['key' => 'lock_pin', 'value' => 'hash']);
        $this->assertSame(1, $this->getJson('/api/local/drafts/a.new')->json('data.payload.x'));
        $this->assertSame(2, $this->getJson('/api/local/drafts/b.new')->json('data.payload.x'));

        $this->deleteJson('/api/local/drafts')->assertOk();
        $this->assertNull($this->getJson('/api/local/drafts/a.new')->json('data'));
        $this->assertNull($this->getJson('/api/local/drafts/b.new')->json('data'));
        $this->assertSame(1, DB::table('local_meta')->where('key', 'lock_pin')->count(), 'only drafts go');
    }

    public function test_a_key_is_plain_and_a_draft_is_small(): void
    {
        $this->putJson('/api/local/drafts/'.urlencode('../x'), ['payload' => 1])->assertStatus(404);
        $this->putJson('/api/local/drafts/'.str_repeat('a', 71), ['payload' => 1])->assertStatus(422)->assertJsonValidationErrors('key');
        $this->putJson('/api/local/drafts/big.one', ['payload' => ['text' => str_repeat('x', 70_000)]])->assertStatus(422)->assertJsonValidationErrors('payload');
        $this->putJson('/api/local/drafts/ok.one', [])->assertStatus(422);
    }
}
