package com.trackme.trackmemobile;

import android.content.Context;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import java.text.SimpleDateFormat;
import java.util.Calendar;


public final class MakeInfopacket {
    private MakeInfopacket() {

    }

    //craft timeStamp String in "MM/dd/yyyy HH:mm:ss" format
    public static String craftTimeStamp() {
        Calendar cal = Calendar.getInstance();
        SimpleDateFormat sdf = new SimpleDateFormat("MM/dd/yyyy HH:mm:ss");
        String ts = sdf.format(cal.getTime());
        return ts;
    }

    public static String getMacAddress(Context context) {
        String macAddress;
        WifiManager wifiManager = (WifiManager) context.getSystemService(Context.WIFI_SERVICE);
        WifiInfo wInfo = wifiManager.getConnectionInfo();
        macAddress = wInfo.getMacAddress();
        return macAddress;
    }


    //milan coordinates
    //latitude
    public static String getGeoX() {
        return "45.462";
    }
    //longitude
    public static String getGeoY() {
        return "9.037";
    }
}
