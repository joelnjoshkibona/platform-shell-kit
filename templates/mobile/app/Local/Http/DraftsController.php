<?php

namespace App\Local\Http;

use App\Http\Controllers\Controller;
use App\Local\Drafts;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** /api/local/drafts/{key} (P58): the phone's unfinished forms, in every data mode. Reachable only from inside the app (P93). */
class DraftsController extends Controller
{
    public function __construct(private Drafts $drafts) {}

    public function show(string $key): JsonResponse
    {
        return $this->ok($this->drafts->get($key));
    }

    public function save(Request $request, string $key): JsonResponse
    {
        $request->validate(['payload' => ['present']]);
        $this->drafts->put($key, $request->input('payload'));

        return $this->ok(['saved' => true]);
    }

    public function forget(string $key): JsonResponse
    {
        $this->drafts->forget($key);

        return $this->ok(['forgotten' => true]);
    }

    public function forgetAll(): JsonResponse
    {
        $this->drafts->forgetAll();

        return $this->ok(['forgotten' => true]);
    }

    private function ok(mixed $data): JsonResponse
    {
        return response()->json(['status' => true, 'code' => 200, 'message' => 'OK', 'data' => $data]);
    }
}
