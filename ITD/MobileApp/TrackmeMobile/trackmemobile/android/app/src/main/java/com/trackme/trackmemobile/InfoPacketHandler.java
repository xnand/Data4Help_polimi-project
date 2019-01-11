package com.trackme.trackmemobile;

import android.support.annotation.NonNull;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Base64;
import com.google.android.gms.common.util.Base64Utils;
import com.google.android.gms.wearable.MessageClient;
import com.google.android.gms.wearable.MessageEvent;
import com.google.android.gms.wearable.Wearable;
import com.trackme.trackmemobile.InfoPacketHandler;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.TimeUnit;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;


public class InfoPacketHandler extends AppCompatActivity implements MessageClient.OnMessageReceivedListener {

    private BlockingQueue<JSONObject> messagesQueue;
    InfoPacketHandler() {
        this.messagesQueue = new ArrayBlockingQueue<>(10);
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
                System.out.println(messagesQueue.remainingCapacity());
            } //fill the queue

            //System.out.println("got heart beat rate " + j.get("heartBeatRate"));
        } catch (JSONException e) {
            e.printStackTrace();
        }



    }

    public String getMessage () {
        System.out.println("called");
        return messagesQueue.remove().toString();

    }

    public void putMessage(JSONObject j) {
        messagesQueue.offer(j);
    }

    public String startService(String SSN, String email, String password) {


        return "service started";
    }

}

class NetworkUtil  {
    String credentials =  "user : password";

    void post() throws UnsupportedEncodingException {

        byte[] data = credentials.getBytes("UTF-8");
        String payload = "Basic" + Base64.encodeToString(data, Base64.DEFAULT);

        BufferedReader httpResponseReader = null;
        try {
            // Connect to the web server endpoint
            URL serverUrl = new URL("http://httpbin.org/basic-auth/user/passwd");
            HttpURLConnection urlConnection = (HttpURLConnection) serverUrl.openConnection();

            // Set HTTP method as GET
            urlConnection.setRequestMethod("GET");

            // Include the HTTP Basic Authentication payload
            urlConnection.addRequestProperty("Authorization", payload);

            // Read response from web server, which will trigger HTTP Basic Authentication request to be sent.
            httpResponseReader =
                    new BufferedReader(new InputStreamReader(urlConnection.getInputStream()));
            String lineRead;
            while((lineRead = httpResponseReader.readLine()) != null) {
                System.out.println(lineRead);
            }

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
}






