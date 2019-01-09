package com.trackme.trackmemobile;

import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.wearable.activity.WearableActivity;
import android.widget.SeekBar;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.android.gms.wearable.CapabilityClient;
import com.google.android.gms.wearable.CapabilityInfo;
import com.google.android.gms.wearable.Node;
import com.google.android.gms.wearable.Wearable;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Set;
import java.util.concurrent.ExecutionException;

public class MainActivity extends WearableActivity {

    private SeekBar heartBeatSlider;
    private SeekBar systolicSlider;
    private SeekBar diastolicSlider;

    private static final String INFOPACKET_CAPABILITY = "infopacket_transmission";


    final int MAX_HEART_BEAT = 180;
    final int MIN_HEART_BEAT = 30;
    final int MAX_DIASTOLIC = 100;
    final int MIN_DIASTOLIC = 40;
    final int MAX_SYSTOLIC = 190;
    final int MIN_SYSTOLIC = 70;
    final int STEP = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        heartBeatSlider = findViewById(R.id.heartBeatSlider);
        systolicSlider = findViewById(R.id.systolicSlider);
        diastolicSlider = findViewById(R.id.diastolicSlider);

        heartBeatSlider.setMax((MAX_HEART_BEAT - MIN_HEART_BEAT)/STEP);
        systolicSlider.setMax((MAX_SYSTOLIC - MIN_SYSTOLIC)/STEP);
        diastolicSlider.setMax((MAX_DIASTOLIC - MIN_DIASTOLIC)/STEP);

        // Enables Always-on
        setAmbientEnabled();

        PacketHandler p = new PacketHandler();
        p.start();
    }

    private String mobileNodeId = null;
    CapabilityInfo capabilityInfo = null;

    private void setupVoiceTranscription() throws ExecutionException, InterruptedException {
        capabilityInfo = Tasks.await(
                Wearable.getCapabilityClient(this.getApplicationContext()).getCapability(
                        INFOPACKET_CAPABILITY, CapabilityClient.FILTER_REACHABLE));

        // capabilityInfo has the reachable nodes with the capability
        updateCapabilityInfo(capabilityInfo);
        CapabilityClient.OnCapabilityChangedListener capabilityListener = new CapabilityClient.OnCapabilityChangedListener() {
            @Override
            public void onCapabilityChanged(@NonNull CapabilityInfo capabilityInfo) {
                updateCapabilityInfo(capabilityInfo);
            }
        };

        Wearable.getCapabilityClient(this.getApplicationContext()).addListener(
                capabilityListener,
                INFOPACKET_CAPABILITY);
    }

    private void updateCapabilityInfo(CapabilityInfo capabilityInfo) {
        Set<Node> connectedNodes = capabilityInfo.getNodes();

        mobileNodeId = pickBestNodeId(connectedNodes);
    }

    private String pickBestNodeId(Set<Node> nodes) {
        String bestNodeId = null;
        // Find a nearby node or pick one arbitrarily
        for (Node node : nodes) {
            if (node.isNearby()) {
                return node.getId();
            }
            bestNodeId = node.getId();
        }
        return bestNodeId;
    }

    public static final String INFOPACKET_TRANSMISSION_PATH = "/infopacket_transmission"; // TODO duplicate?

    private void sendInfoPacket(byte[] voiceData) {
        if (mobileNodeId != null) {
            Task<Integer> sendTask =
                    Wearable.getMessageClient(this.getApplicationContext()).sendMessage(
                            mobileNodeId, INFOPACKET_TRANSMISSION_PATH, voiceData);
            // You can add success and/or failure listeners,
            // Or you can call Tasks.await() and catch ExecutionException
            sendTask.addOnSuccessListener(new OnSuccessListener<Integer>() {

                @Override
                public void onSuccess(Integer integer) {
                    System.out.println("packet sent!");
                }
            });
            sendTask.addOnFailureListener(new OnFailureListener() {
                @Override
                public void onFailure(@NonNull Exception e) {
                    System.out.println("packet NOT sent :(");
                }
            });
        } else {
            // Unable to retrieve node with transcription capability
            System.out.println("no nodes :((");
        }
    }


    class PacketHandler extends Thread {

//        Activity context;
        private boolean set = false;

        PacketHandler() {};

        public void run() {
            while (true) {
                if (!this.set) {
                    try {
                        setupVoiceTranscription();
                        this.set = true;
                    } catch (ExecutionException e) {
                        e.printStackTrace();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
                updateCapabilityInfo(capabilityInfo);
                try {
                    JSONObject json = new JSONObject();
                    json.put("heartBeatRate", 150);
                    sendInfoPacket(json.toString().getBytes());
                    sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        }
    }

}
