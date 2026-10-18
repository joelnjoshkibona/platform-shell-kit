<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\File;
use Tests\TestCase;

/** (the product's phone app decision): every path inside the app returns the web build's index.html; Vue's router takes it from there. */
class WebBuildTest extends TestCase
{
    private string $index;

    private ?string $kept = null;

    protected function setUp(): void
    {
        parent::setUp();
        $this->index = resource_path('spa/index.html');
        $this->kept = is_file($this->index) ? file_get_contents($this->index) : null;
    }

    protected function tearDown(): void
    {
        $this->kept === null ? File::delete($this->index) : file_put_contents($this->index, $this->kept);
        parent::tearDown();
    }

    public function test_every_path_returns_the_web_build(): void
    {
        File::ensureDirectoryExists(dirname($this->index));
        file_put_contents($this->index, '<!doctype html><div id="app"></div><script src="/assets/app.js?v=1"></script>');

        foreach (['/', '/k/till', '/k/sales/S-0001?tab=history'] as $path) {
            $this->get($path)->assertOk()->assertHeader('Content-Type', 'text/html; charset=UTF-8')->assertSee('<div id="app">', false);
        }
    }

    public function test_a_missing_build_says_so(): void
    {
        File::delete($this->index);

        $this->get('/k/till')->assertStatus(503)->assertSee('run scripts/build-web.sh');
    }
}
