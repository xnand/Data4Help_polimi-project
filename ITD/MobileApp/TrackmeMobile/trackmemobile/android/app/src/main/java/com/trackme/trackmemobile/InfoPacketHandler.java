package com.trackme.trackmemobile;

import android.support.annotation.NonNull;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import com.google.android.gms.wearable.MessageClient;
import com.google.android.gms.wearable.MessageEvent;
import com.google.android.gms.wearable.Wearable;
import com.trackme.trackmemobile.InfoPacketHandler;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

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



}
