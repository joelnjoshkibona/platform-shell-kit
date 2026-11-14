<?php

namespace Tests\Feature\Local;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * P102 sync mode on the phone: a change made here is kept and queued; the server's answers and changes are taken in
 * (done, conflict, refused); the person decides a conflict (keep mine, use theirs) or a refusal (send again, throw away).
 */
class SyncQueueTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['local.mode' => 'sync']);
    }

    private function save(array $record, ?string $id = null): array
    {
        return $this->postJson('/api/local/Notes/save', ['record' => $record, 'id' => $id])->assertSuccessful()->json('data');
    }

    private function outbox(): array
    {
        return $this->getJson('/api/local/sync/outbox')->assertOk()->json('data.changes');
    }

    private function answer(array $results): void
    {
        $this->postJson('/api/local/sync/results', ['results' => $results])->assertOk();
    }

    private function state(): array
    {
        return $this->getJson('/api/local/sync/state')->assertOk()->json('data');
    }

    private function local(string $id): ?array
    {
        return $this->getJson("/api/local/Notes/{$id}/view")->json('data');
    }

    private function server(string $id, string $name, int $version): array
    {
        return ['uuid' => $id, 'id' => 7, 'name' => $name, 'version' => $version];
    }

    public function test_changes_are_queued_in_order_and_done_ones_take_the_servers_copy(): void
    {
        $task = $this->save(['name' => 'One']);
        $this->save(['name' => 'Two'], $task['uuid']);
        $box = $this->outbox();
        $this->assertSame([['create', null, 'One'], ['edit', null, 'Two']], array_map(fn ($c) => [$c['op'], $c['version'], $c['record']['name']], $box));
        $this->assertCount(2, $this->state()['waiting']);

        $this->answer([['key' => $box[0]['key'], 'status' => 'done', 'record' => $this->server($task['uuid'], 'One', 1)]]);
        $this->assertSame([['edit', 1]], array_map(fn ($c) => [$c['op'], $c['version']], $this->outbox()), 'the next change builds on the new version');
        $this->assertSame('Two', $this->local($task['uuid'])['name'], 'mine still shows while it waits');

        $this->answer([['key' => $this->outbox()[0]['key'], 'status' => 'done', 'record' => $this->server($task['uuid'], 'Two', 2)]]);
        $this->assertSame([], $this->outbox());
        $this->assertSame([2, 7], [$this->local($task['uuid'])['version'], $this->local($task['uuid'])['id']]);
    }

    public function test_the_servers_changes_come_in_but_never_over_mine(): void
    {
        $mine = $this->save(['name' => 'Mine, waiting']);
        $this->postJson('/api/local/sync/changes', ['cursor' => 'c1', 'changes' => [
            ['module' => 'Notes', 'id' => 'srv-1', 'op' => 'upsert', 'record' => $this->server('srv-1', 'From the server', 3), 'version' => 3],
            ['module' => 'Notes', 'id' => $mine['uuid'], 'op' => 'upsert', 'record' => $this->server($mine['uuid'], 'Theirs', 4), 'version' => 4],
        ]])->assertOk()->assertJsonPath('data.applied', 1);
        $this->assertSame('From the server', $this->local('srv-1')['name']);
        $this->assertSame('Mine, waiting', $this->local($mine['uuid'])['name']);
        $this->assertSame('c1', $this->getJson('/api/local/sync/outbox')->json('data.cursor'));
        $this->assertNotNull($this->state()['last_synced_at']);

        $this->postJson('/api/local/sync/changes', ['cursor' => 'c2', 'changes' => [['module' => 'Notes', 'id' => 'srv-1', 'op' => 'delete', 'record' => null, 'version' => 3]]])->assertOk();
        $this->assertNull($this->local('srv-1'));
    }

    public function test_a_conflict_waits_for_the_person_keep_mine_sends_it_on_their_version(): void
    {
        $this->postJson('/api/local/sync/changes', ['cursor' => 'c1', 'changes' => [['module' => 'Notes', 'id' => 't1', 'op' => 'upsert', 'record' => $this->server('t1', 'Original', 1), 'version' => 1]]]);
        $this->save(['name' => 'Mine'], 't1');
        $this->save(['name' => 'Mine again'], 't1');
        [$first] = $this->outbox();
        $this->assertSame(1, $first['version']);

        $this->answer([['key' => $first['key'], 'status' => 'conflict', 'record' => $this->server('t1', 'Theirs', 2)]]);
        $this->assertSame([], $this->outbox(), 'the record\'s later change waits too');
        $conflict = $this->state()['conflicts'][0];
        $this->assertSame(['Mine', 'Theirs'], [$conflict['mine']['name'], $conflict['theirs']['name']]);

        $this->postJson("/api/local/sync/queue/{$conflict['ulid']}/keep-mine")->assertOk();
        $this->assertSame([['Mine', 2], ['Mine again', 1]], array_map(fn ($c) => [$c['record']['name'], $c['version']], $this->outbox()));
        $this->assertNotSame($first['key'], $this->outbox()[0]['key'], 'a new change for the server, so a new key');
    }

    public function test_use_theirs_drops_my_changes_to_that_record(): void
    {
        $this->postJson('/api/local/sync/changes', ['cursor' => 'c1', 'changes' => [['module' => 'Notes', 'id' => 't1', 'op' => 'upsert', 'record' => $this->server('t1', 'Original', 1), 'version' => 1]]]);
        $this->save(['name' => 'Mine'], 't1');
        $this->answer([['key' => $this->outbox()[0]['key'], 'status' => 'conflict', 'record' => $this->server('t1', 'Theirs', 2)]]);

        $this->postJson('/api/local/sync/queue/'.$this->state()['conflicts'][0]['ulid'].'/use-theirs')->assertOk();
        $this->assertSame(['Theirs', 2], [$this->local('t1')['name'], $this->local('t1')['version']]);
        $this->assertSame(0, DB::table('sync_queue')->count());
    }

    public function test_a_refused_change_is_sent_again_or_thrown_away(): void
    {
        $new = $this->save(['name' => 'Not allowed']);
        $this->answer([['key' => $this->outbox()[0]['key'], 'status' => 'refused', 'reason' => 'You may not create this record (Tasks.create).']]);
        $refused = $this->state()['refused'][0];
        $this->assertSame(['Not allowed', 'You may not create this record (Tasks.create).'], [$refused['title'], $refused['reason']]);
        $this->assertSame([], $this->outbox());

        $before = DB::table('sync_queue')->value('key');
        $this->postJson("/api/local/sync/queue/{$refused['ulid']}/retry")->assertOk();
        $this->assertCount(1, $this->outbox());
        $this->assertNotSame($before, $this->outbox()[0]['key']);
        $this->answer([['key' => $this->outbox()[0]['key'], 'status' => 'refused', 'reason' => 'Still no.']]);

        $this->postJson("/api/local/sync/queue/{$refused['ulid']}/discard")->assertOk();
        $this->assertNull($this->local($new['uuid']), 'the server never had it, so it goes');

        $this->postJson('/api/local/sync/changes', ['cursor' => 'c1', 'changes' => [['module' => 'Notes', 'id' => 't1', 'op' => 'upsert', 'record' => $this->server('t1', 'Original', 1), 'version' => 1]]]);
        $this->save(['name' => 'Renamed'], 't1');
        $this->answer([['key' => $this->outbox()[0]['key'], 'status' => 'refused', 'reason' => 'No.']]);
        $this->postJson('/api/local/sync/queue/'.$this->state()['refused'][0]['ulid'].'/discard')->assertOk();
        $this->assertSame('Original', $this->local('t1')['name'], 'back to the server\'s copy');
    }

    public function test_a_delete_is_queued_on_the_version_it_deleted(): void
    {
        $this->postJson('/api/local/sync/changes', ['cursor' => 'c1', 'changes' => [['module' => 'Notes', 'id' => 't1', 'op' => 'upsert', 'record' => $this->server('t1', 'Original', 3), 'version' => 3]]]);
        $this->deleteJson('/api/local/Notes/t1/delete')->assertOk();
        $this->assertNull($this->local('t1'));
        $this->assertSame([['delete', 't1', 3]], array_map(fn ($c) => [$c['op'], $c['id'], $c['version']], $this->outbox()));
        $this->answer([['key' => $this->outbox()[0]['key'], 'status' => 'done', 'record' => null]]);
        $this->assertSame(0, DB::table('local_records')->count());
    }

    public function test_signing_out_forgets_the_phones_copy(): void
    {
        $this->save(['name' => 'Gone after sign-out']);
        $this->postJson('/api/local/sync/forget')->assertOk();
        $this->assertSame([0, 0], [DB::table('local_records')->count(), DB::table('sync_queue')->count()]);
    }
}
