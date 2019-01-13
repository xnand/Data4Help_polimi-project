package com.trackme.trackmemobile;

import android.content.Intent;
import android.os.AsyncTask;
import android.support.annotation.NonNull;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Base64;
import com.google.android.gms.wearable.MessageClient;
import com.google.android.gms.wearable.MessageEvent;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

//a Singleton implementation of the packet handler
//packet are sent using a FIFO policy to the application server
public class InfoPacketHandler extends AppCompatActivity implements MessageClient.OnMessageReceivedListener {

    private static InfoPacketHandler instance;
    private BlockingQueue<JSONObject> messagesQueue;
    private String macAddr = null;



    private boolean emergencyFlag = false;
    private final double emergencyThreshold = 30;
    private double currentThreshold = 0.00;

    final int normalAreaSys = 120;
    final int PrehypertensionAreaSys = 139;
    final int HypertensionStage1AreaSys = 190 * 100;


    private InfoPacketHandler() {
        this.messagesQueue = new ArrayBlockingQueue<>(10);
    }

    public static InfoPacketHandler getInstance() {
        if(instance == null) {
            instance = new InfoPacketHandler();
        }
        return instance;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_info_packet_handler);

    }

    @Override
    public void onMessageReceived(@NonNull MessageEvent messageEvent) {
//        System.out.println("message received!");
//        System.out.println(new String(messageEvent.getData()));


        JSONObject j = null;
        try {
            j = new JSONObject(new String(messageEvent.getData()));
            if(messagesQueue != null) {
                putMessage(j);

            } //fill the queue

            //System.out.println("got heart beat rate " + j.get("heartBeatRate"));
        } catch (JSONException e) {
            e.printStackTrace();
        }



    }




    public JSONObject getMessage () {

        return messagesQueue.remove();


    }

    public void putMessage(JSONObject j) {
        messagesQueue.offer(j);
    }

    public String getMacAddr() {
        return macAddr;
    }

    public void setMacAddr(String macAddr) {
        this.macAddr = macAddr;
    }

    public boolean isEmergencyFlag() {
        return emergencyFlag;
    }

    public String startService(String SSN, String email, String password) {


        return "service started";
    }

    public void checkIfEmergency(String heartbeatAsStr, String diastolicAsStr, String systolicAsStr) {
        int heartbeat = Integer.parseInt(heartbeatAsStr);
        int diastolic = Integer.parseInt(diastolicAsStr);
        int systolic = Integer.parseInt(systolicAsStr);

        double pointToAdd = rateReading(diastolic, systolic);

        //if the packet is nominal, decrease the current threshold or do nothing
        if(pointToAdd == 0 && currentThreshold > 0) currentThreshold-= currentThreshold;

        //if the packet is not nominal, then increase current threshold
        else if(pointToAdd > 0) currentThreshold+= pointToAdd;

        if(currentThreshold >= emergencyThreshold) emergencyFlag = true;

    }

    double rateReading(int diastolic, int systolic) {

        double pointToadd = 0;

        //PreHypertension
        if(systolic > 120) pointToadd+= 0.5;
        if(diastolic > 80) pointToadd+=0.5;

        //Hypertension stage 1
        if(systolic > 159) pointToadd+=1.0;
        if (diastolic > 99) pointToadd+=1.0;

        //Hypertension stage 2
        if(systolic> 160) pointToadd+=1.5;
        if(diastolic> 100) pointToadd+=1.5;

        //HypertensiveCrisis
        if(systolic>180) pointToadd += 15;
        if(diastolic>110)pointToadd += 15;

        return pointToadd;

    }


}

class NetworkUtil extends AsyncTask<String, Void, Void > {

    private boolean  sendFlag = true;
    private final  String basicUrl = "http://192.168.1.86:3001/api/";  //TODO metterlo da qualche parte

    NetworkUtil() {

    }

    //http://'application server url'/api/packet {POST}
    private void post(String SSN, String email, String password) throws UnsupportedEncodingException {

        //generate the basicAuth string
        String credentials =  email + ":" + password;
        byte[] data = credentials.getBytes("UTF-8");
        String authString = "Basic " + Base64.encodeToString(data, Base64.NO_WRAP);
        JSONObject resp;

        //packet specific information
        BufferedReader httpResponseReader = null;
        String packet = null;

        try {
             packet = craftToSendString();
        } catch (JSONException e) {
            e.printStackTrace();
        }

        try {
            // Connect to the web server endpoint
            URL serverUrl = new URL(basicUrl + SSN + "/packet");
            HttpURLConnection urlConnection = (HttpURLConnection) serverUrl.openConnection();
            urlConnection.setRequestProperty("Authorization", authString);
            urlConnection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");

            // Set HTTP method as POST
            urlConnection.setDoOutput(true);
            urlConnection.setRequestMethod("POST");

            // Include the HTTP Basic Authentication authString


            // Writing the post data to the HTTP request body
            BufferedWriter httpRequestBodyWriter = new BufferedWriter(new OutputStreamWriter(urlConnection.getOutputStream()));

            httpRequestBodyWriter.write(packet);
            httpRequestBodyWriter.close();

            // Read response from web server, which will trigger HTTP Basic Authentication request to be sent.
//            httpResponseReader = new BufferedReader(new InputStreamReader(urlConnection.getInputStream()));

            // Reading from the HTTP response body
            if(urlConnection.getResponseCode() == 201) {
                Scanner httpResponseScanner = new Scanner(urlConnection.getInputStream());
                while (httpResponseScanner.hasNextLine()) {
                     resp = new JSONObject(httpResponseScanner.nextLine());

                     //launch the emergency activity
                         if(resp.has("eta")){
                             Intent i = new Intent(MainActivity.getContext(),FullscreenActivity.class);
                             sendFlag = false;
                             MainActivity.getContext().startActivity(i);
                         }




                }

                httpResponseScanner.close();
            }
        } catch (IOException ioe) {
            ioe.printStackTrace();
        } catch (JSONException e) {
            e.printStackTrace();
        } finally {

            if (httpResponseReader != null) {
                try {
                    httpResponseReader.close();
                } catch (IOException ioe) {
                    // Close quietly
                }
            }
        }


    }
        //this function generate the string containing the  that will be sent to the server
    private String craftToSendString() throws JSONException {

        String payload;
        JSONObject packet = InfoPacketHandler.getInstance().getMessage();
        if(InfoPacketHandler.getInstance().getMacAddr() == null) {
            InfoPacketHandler.getInstance().setMacAddr(packet.getString("macAddr"));
        }

        //POST fields
        String ts = packet.getString("ts");
        String wearableMac = packet.getString("macAddr");
        String geoX = packet.getString("geoX");
        String geoY = packet.getString("geoY");
        String hearbeatRate =  packet.getString("heartRate");
        String bloodPressSyst = packet.getString("systolic");
        String bloodPressDias = packet.getString("diastolic");
        System.out.print(bloodPressDias + " / ");
        System.out.print(bloodPressSyst);
        InfoPacketHandler.getInstance().checkIfEmergency(hearbeatRate, bloodPressDias, bloodPressSyst);
        String emergencyStatus = "false";

        if(InfoPacketHandler.getInstance().isEmergencyFlag())
            emergencyStatus = "true";

        System.out.println("  " +emergencyStatus);
        //payload if in application/x-www-form-urlencoded format
        payload=
                "ts=" + ts + "&" +
                "wearableMac=" + wearableMac + "&" +
                "geoX=" + geoX + "&" +
                "geoY=" + geoY + "&" +
                "heartBeatRate=" + hearbeatRate + "&" +
                "bloodPressSyst=" + bloodPressSyst + "&" +
                "bloodPressDias=" + bloodPressDias + "&" +
                "emergency="   +    emergencyStatus;

        return payload;
    }


    //this function send periodically packet to the server
    @Override
    protected Void doInBackground(String... strings) {
            while (sendFlag == true) {
                try {

                    post(strings[0], strings[1], strings[2]);       ///SSN, email, password
                    Thread.sleep(1000);

                } catch (Exception e) {
                    System.err.print(e);
                }
            }


        return null;
    }



}







