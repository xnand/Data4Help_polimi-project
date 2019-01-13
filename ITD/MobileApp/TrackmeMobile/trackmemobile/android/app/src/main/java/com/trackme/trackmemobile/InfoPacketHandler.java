package com.trackme.trackmemobile;

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

    public void setMacAddr(String macAddr) {
        this.macAddr = macAddr;
    }




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

    public String startService(String SSN, String email, String password) {


        return "service started";
    }

    public String getMacAddr() {
        return macAddr;
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
            System.out.println(urlConnection.getResponseCode());
            // Read response from web server, which will trigger HTTP Basic Authentication request to be sent.
//            httpResponseReader = new BufferedReader(new InputStreamReader(urlConnection.getInputStream()));

            // Reading from the HTTP response body
            Scanner httpResponseScanner = new Scanner(urlConnection.getInputStream());
            while(httpResponseScanner.hasNextLine()) {
                System.out.println(httpResponseScanner.nextLine());
            }
            httpResponseScanner.close();

        } catch (IOException ioe) {
            ioe.printStackTrace();
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
        System.out.println(packet.toString());
        //POST fields
        String ts = packet.getString("ts");
        String wearableMac = packet.getString("macAddr");
        String geoX = packet.getString("geoX");
        String geoY = packet.getString("geoY");
        String hearbeatRate =  packet.getString("heartRate");
        String bloodPressSyst = packet.getString("systolic");
        String bloodPressDias = packet.getString("diastolic");


        //payload if in application/x-www-form-urlencoded format
        payload=
                "ts=" + ts + "&" +
                "wearableMac=" + wearableMac + "&" +
                "geoX=" + geoX + "&" +
                "geoY=" + geoY + "&" +
                "heartBeatRate=" + hearbeatRate + "&" +
                "bloodPressSyst=" + bloodPressSyst + "&" +
                "bloodPressDias=" + bloodPressDias;

        return payload;
    }


    //this function send periodically packet to the server
    @Override
    protected Void doInBackground(String... strings) {
            while (sendFlag = true) {
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






