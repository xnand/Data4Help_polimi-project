package com.trackme.trackmemobile;

import android.app.Activity;
import android.os.Bundle;
import android.support.annotation.NonNull;
import com.google.android.gms.wearable.MessageEvent;
import com.google.android.gms.wearable.Wearable;
import io.flutter.app.FlutterActivity;
import io.flutter.plugins.GeneratedPluginRegistrant;
import io.flutter.plugin.common.MethodCall;
import io.flutter.plugin.common.MethodChannel;
import io.flutter.plugin.common.MethodChannel.MethodCallHandler;
import io.flutter.plugin.common.MethodChannel.Result;
import com.google.android.gms.wearable.MessageClient;
import com.google.android.gms.wearable.Wearable;

public class MainActivity extends FlutterActivity {
    private static final String CHANNEL = "com.trackme.trackmemobile/packet";
    private Activity activity = this;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    GeneratedPluginRegistrant.registerWith(this);

    new MethodChannel(getFlutterView(), CHANNEL).setMethodCallHandler(
            new MethodCallHandler() {
              @Override
              public void onMethodCall(MethodCall call, Result result) {
                if (call.method.equals("setupPacketHandler")) {
                  Wearable.getMessageClient(activity).addListener(new InfoPacketHandler());
                  System.out.println("fankulo");
                }
                else {
                  result.notImplemented();
                }
              }
            });
  }
}
