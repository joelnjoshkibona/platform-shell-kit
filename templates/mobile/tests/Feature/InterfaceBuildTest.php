<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\File;
use Tests\TestCase;

/** P93: every path that is not /api returns the phone interface's index.html (public/spa); the interface takes it from there. */
class InterfaceBuildTest extends TestCase
{
    private string $index;

    private ?string $kept = null;

    protected function setUp(): void
    {
        parent::setUp();
        $this->index = public_path('spa/index.html');
        $this->kept = is_file($this->index) ? file_get_contents($this->index) : null;
    }

    protected function tearDown(): void
    {
        $this->kept === null ? File::delete($this->index) : file_put_contents($this->index, $this->kept);
        parent::tearDown();
    }

    public function test_every_path_returns_the_interface(): void
    {
        File::ensureDirectoryExists(dirname($this->index));
        file_put_contents($this->index, '<!doctype html><div id="app"></div><script src="/spa/assets/app.js"></script>');

        foreach (['/', '/k/till', '/k/sales/S-0001?tab=history'] as $path) {
            $this->get($path)->assertOk()->assertHeader('Content-Type', 'text/html; charset=UTF-8')->assertSee('<div id="app">', false);
        }
    }

    public function test_a_missing_build_says_so(): void
    {
        File::delete($this->index);

        $this->get('/k/till')->assertStatus(503)->assertSee('run scripts/build-web.sh');
    }

    public function test_api_paths_are_not_the_interface(): void
    {
        File::ensureDirectoryExists(dirname($this->index));
        file_put_contents($this->index, '<!doctype html><div id="app"></div>');

        $this->get('/api/nothing-here')->assertNotFound();
    }
}
