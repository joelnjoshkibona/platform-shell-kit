<?php

return [
    /*
     * P102: where this app's data lives. connected: the API (the phone keeps nothing); phone: here, with no server;
     * sync: here, with a queue of changes sent to the API when there is signal. The same value is baked into the
     * interface (VITE_DATA_MODE) by scripts/build-web.sh.
     */
    'mode' => env('APP_DATA_MODE', 'connected'),
];
