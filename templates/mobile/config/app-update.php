<?php

return [

    /*
     * P79: updates from a static page. The public latest.json on the product's download page (GitHub Pages), read by this
     * server, never by the interface. Empty: the app takes its updates from the product's API instead (P53, server mode).
     */
    'feed' => env('APP_UPDATE_FEED', ''),

    /** The download page people open in a browser: the feed's folder unless set. */
    'page' => env('APP_UPDATE_PAGE', ''),

    /** Tests and a development server: offer an update off the phone too (the download itself needs the phone). */
    'offer_off_phone' => (bool) env('APP_UPDATE_OFFER', false),

];
