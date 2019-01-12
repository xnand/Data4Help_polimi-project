package com.trackme.trackmemobile;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationManager;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.content.Context;
import android.support.v4.app.ActivityCompat;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

public final class MakeInfopacket {
    private MakeInfopacket() {

    }

    //craft timeStamp String in "dd/MM/yyyy HH:mm:ss" format
    public static String craftTimeStamp() {
        Calendar cal = Calendar.getInstance();
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
        String tp = sdf.format(cal.getTime());
        return tp;
    }

    public static String getMacAddress(Context context) {
        String macAddress = null;
        WifiManager wifiManager = (WifiManager) context.getSystemService(Context.WIFI_SERVICE);
        WifiInfo wInfo = wifiManager.getConnectionInfo();
        macAddress = wInfo.getMacAddress();
        return macAddress;
    }

    //latitude
    public static String getGeoX(Context context) {
        String geoX = null;
        LocationManager lm = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
        if (ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED
                && ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            // TODO: adjust permissions
            System.out.println("problema con i permessi");
            //    ActivityCompat#requestPermissions
            // here to request the missing permissions, and then overriding
            //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
            //                                          int[] grantResults)
            // to handle the case where the user grants the permission. See the documentation
            // for ActivityCompat#requestPermissions for more details.
            return null;
        }
        Location location = lm.getLastKnownLocation(LocationManager.GPS_PROVIDER);
        geoX = Double.toString(location.getLatitude());
        return geoX;
    }
}
