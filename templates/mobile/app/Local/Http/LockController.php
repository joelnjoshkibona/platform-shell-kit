<?php

namespace App\Local\Http;

use App\Http\Controllers\Controller;
use App\Local\AppLock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** /api/local/lock/* (P65): the PIN lock, in every data mode. Reachable only from inside the app (P93). */
class LockController extends Controller
{
    public function __construct(private AppLock $lock) {}

    public function status(): JsonResponse
    {
        return $this->ok($this->lock->status());
    }

    public function set(Request $request): JsonResponse
    {
        $request->validate(['pin' => ['required', 'string'], 'current' => ['nullable', 'string']]);

        return $this->ok($this->lock->set((string) $request->input('pin'), $request->input('current')));
    }

    public function verify(Request $request): JsonResponse
    {
        $request->validate(['pin' => ['required', 'string']]);

        return $this->ok($this->lock->verify((string) $request->input('pin')));
    }

    public function clear(): JsonResponse
    {
        $this->lock->clear();

        return $this->ok($this->lock->status());
    }

    private function ok(array $data): JsonResponse
    {
        return response()->json(['status' => true, 'code' => 200, 'message' => 'OK', 'data' => $data]);
    }
}
