package com.trackme.trackmemobile;

import android.os.Bundle;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.wearable.Wearable;
import com.google.android.gms.wearable.WearableListenerService;

// adb -d forward tcp:5601 tcp:5601

public class MobileWearableService extends WearableListenerService
        implements GoogleApiClient.ConnectionCallbacks {
    private GoogleApiClient mGoogleApiClient;
    private boolean nodeConnected =false;

    @Override
    public void onCreate() {
        super.onCreate();
        mGoogleApiClient = new GoogleApiClient.Builder(this)
                .addApi(Wearable.API)
                .addConnectionCallbacks(this)
                .build();
        mGoogleApiClient.connect();
    }

    @Override
    public void onConnected(Bundle bundle) {

    }

    @Override
    public void onConnectionSuspended(int i)
    {
        nodeConnected = false;
    }


}
