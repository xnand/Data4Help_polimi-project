package com.trackme.trackmemobile;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import com.google.android.gms.wearable.Wearable;
import io.flutter.app.FlutterActivity;
import io.flutter.plugins.GeneratedPluginRegistrant;
import io.flutter.plugin.common.MethodCall;
import io.flutter.plugin.common.MethodChannel;
import io.flutter.plugin.common.MethodChannel.MethodCallHandler;
import io.flutter.plugin.common.MethodChannel.Result;
import java.io.IOException;
import java.io.UnsupportedEncodingException;

public class MainActivity extends FlutterActivity {
    private static final String CHANNEL = "com.trackme.trackmemobile/packet";
    private Activity activity = this;
    private NetworkUtil networkUtil = new NetworkUtil();
    private static Context context;

    public static void setContext(Context context) {
        MainActivity.context = context;
    }

    public static Context getContext() {
        return context;
    }

    @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    MainActivity.setContext(getApplicationContext());
      GeneratedPluginRegistrant.registerWith(this);
      new MethodChannel(getFlutterView(), CHANNEL).setMethodCallHandler(new CommunicationPlugin(activity));


  }

    public void launchSecondActivity(View view) {
        Intent intent = new Intent(this, FullscreenActivity.class);
        startActivity(intent);
    }




}

class CommunicationPlugin implements MethodCallHandler {
    Activity activity;
    final InfoPacketHandler infoPacketHandler;
    final NetworkUtil networkUtil = new NetworkUtil();

    CommunicationPlugin(Activity activity) {
        this.infoPacketHandler = InfoPacketHandler.getInstance();
        this.activity = activity;

}
    @Override
    public void onMethodCall(MethodCall call, Result result) {
        switch (call.method) {
            case
                    "setupPacketHandler" : Wearable.getMessageClient(activity).addListener(infoPacketHandler);
                break;

            case "getMessage" : result.success(infoPacketHandler.getMessage());
                break;

            case "startService" :
                final String SSN = call.argument("SSN");
                final String email = call.argument("email");
                final String password = call.argument("password");
                try {
                    networkUtil.execute(SSN, email, password);
                } catch (Exception e) {
                    e.printStackTrace();
                }
                break;

            case "getMacAddr" :
                result.success(InfoPacketHandler.getInstance().getMacAddr());
        }
    }


}