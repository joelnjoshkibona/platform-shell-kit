<?php

namespace Tests\Feature\Local;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

require_once __DIR__.'/../../Support/LocalProbes.php';

/** P102, P104: the phone's generic store answers the list contract (P87) over every module's records. */
class LocalStoreTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['local.mode' => 'phone']);
    }

    private function save(array $record, ?string $id = null): array
    {
        return $this->postJson('/api/local/Notes/save', ['record' => $record, 'id' => $id])->assertSuccessful()->json('data');
    }

    private function names(array $query): array
    {
        return array_column($this->getJson('/api/local/Notes/list?'.http_build_query($query))->assertOk()->json('data.data'), 'name');
    }

    public function test_records_are_kept_viewed_changed_and_deleted_with_a_version(): void
    {
        $made = $this->save(['name' => 'Count stock', 'version' => 99, 'uuid' => 'forged']);
        $this->assertSame(26, strlen($made['uuid']));
        $this->assertSame([1, 'Count stock'], [$made['version'], $made['name']]);

        $changed = $this->save(['name' => 'Count all stock'], $made['uuid']);
        $this->assertSame([2, $made['uuid'], $made['created_at']], [$changed['version'], $changed['uuid'], $changed['created_at']]);
        $this->getJson("/api/local/Notes/{$made['uuid']}/view")->assertOk()->assertJsonPath('data.name', 'Count all stock');

        $this->deleteJson("/api/local/Notes/{$made['uuid']}/delete")->assertOk();
        $this->getJson("/api/local/Notes/{$made['uuid']}/view")->assertNotFound();
        $this->assertSame([], $this->names([]));
    }

    public function test_the_list_filters_with_every_operator_searches_sorts_and_pages(): void
    {
        foreach ([['Alpha', 5, 'open'], ['Beta', 10, 'done'], ['Gamma', 15, 'open'], ['Delta 50%', 20, null]] as [$name, $points, $state]) {
            $this->save(['name' => $name, 'points' => $points, 'state' => $state]);
        }
        $f = fn (string $field, string $op, $value = null) => ['filters' => [$field => ['operator' => $op, 'value' => $value]], 'params' => ['sort' => 'name', 'order' => 'asc']];

        $this->assertSame(['Beta'], $this->names($f('points', 'eq', 10)));
        $this->assertSame(['Alpha', 'Delta 50%', 'Gamma'], $this->names($f('points', 'neq', '10')));
        $this->assertSame(['Delta 50%', 'Gamma'], $this->names($f('points', 'gt', 10)));
        $this->assertSame(['Beta', 'Delta 50%', 'Gamma'], $this->names($f('points', 'gte', 10)));
        $this->assertSame(['Alpha'], $this->names($f('points', 'lt', 10)));
        $this->assertSame(['Alpha', 'Beta'], $this->names($f('points', 'lte', 10)));
        $this->assertSame(['Alpha', 'Gamma'], $this->names($f('points', 'in', [5, 15])));
        $this->assertSame(['Beta', 'Delta 50%'], $this->names($f('points', 'nin', '5,15')));
        $this->assertSame(['Delta 50%'], $this->names($f('name', 'contains', '50%')));
        $this->assertSame(['Gamma'], $this->names($f('name', 'begins', 'ga')));
        $this->assertSame(['Alpha', 'Beta', 'Gamma'], $this->names($f('name', 'ends', 'a')));
        $this->assertSame(['Beta', 'Gamma'], $this->names($f('points', 'between', [10, 15])));
        $this->assertSame(['Delta 50%'], $this->names($f('state', 'null')));
        $this->assertSame(['Alpha', 'Beta', 'Gamma'], $this->names($f('state', 'not_null')));
        $this->assertSame(['Beta'], $this->names($f('search', 'contains', 'don')), 'search reads the values');
        $this->assertSame([], $this->names($f('search', 'contains', 'points')), 'not the field names');
        $this->getJson('/api/local/Notes/list?'.http_build_query($f('name', 'like', 'x')))->assertStatus(422);
        $this->getJson('/api/local/Notes/list?'.http_build_query($f("name') or 1=1 --", 'eq', 'x')))->assertStatus(422);

        $page = $this->getJson('/api/local/Notes/list?'.http_build_query(['params' => ['sort' => 'points', 'order' => 'desc', 'per_page' => 3, 'page' => 2]]))->assertOk()->json('data');
        $this->assertSame(['Alpha'], array_column($page['data'], 'name'));
        $this->assertSame(['current_page' => 2, 'last_page' => 2, 'per_page' => 3, 'total' => 4], $page['meta']);
    }

    public function test_modules_are_kept_apart_and_connected_mode_keeps_nothing(): void
    {
        $this->save(['name' => 'A task']);
        $this->postJson('/api/local/Projects/save', ['record' => ['name' => 'A project']])->assertCreated();
        $this->assertSame(['A task'], $this->names([]));
        $this->getJson('/api/local/notes/list')->assertNotFound();

        config(['local.mode' => 'connected']);
        $this->getJson('/api/local/Notes/list')->assertNotFound();
    }

    public function test_a_module_may_add_its_own_rules_on_the_phone(): void
    {
        $this->postJson('/api/local/Probes/save', ['record' => ['name' => '']])->assertStatus(422)->assertJsonValidationErrors('name');
        $made = $this->postJson('/api/local/Probes/save', ['record' => ['name' => 'checked', 'junk' => 'dropped']])->assertCreated()->json('data');
        $this->assertSame(['checked', 'CHECKED'], [$made['name'], $made['shout']]);
        $this->assertArrayNotHasKey('junk', $made);
    }

    public function test_a_module_may_keep_its_own_table(): void
    {
        $this->postJson('/api/local/OwnProbes/save', ['record' => ['name' => 'kept apart']])->assertCreated()->assertJsonPath('data.where', 'own table');
        $this->getJson('/api/local/OwnProbes/list')->assertOk()->assertJsonPath('data.data.0.name', 'kept apart');
        // an edit is an edit (200), although local_records has nothing under that id
        $this->postJson('/api/local/OwnProbes/save', ['id' => 'own-1', 'record' => ['name' => 'changed']])->assertOk()->assertJsonPath('data.name', 'changed');
        $this->assertDatabaseCount('local_records', 0);
    }
}
