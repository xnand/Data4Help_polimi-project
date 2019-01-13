package com.trackme.trackmemobile;

import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.wearable.activity.WearableActivity;
import android.widget.SeekBar;
import android.widget.TextView;
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

    private TextView heartBeatIndicator;
    private TextView pressureIndicator;


    final int MAX_HEART_BEAT = 180;
    final int MIN_HEART_BEAT = 30;
    final int MAX_DIASTOLIC = 120;
    final int MIN_DIASTOLIC = 40;
    final int MAX_SYSTOLIC = 190;
    final int MIN_SYSTOLIC = 70;
    final int STEP = 1;

    private static final String INFOPACKET_CAPABILITY = "infopacket_transmission";




    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initView();
        setListeners();




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
                    System.out.println("sent");

                }
            });
            sendTask.addOnFailureListener(new OnFailureListener() {
                @Override
                public void onFailure(@NonNull Exception e) {
                    //System.out.println("packet NOT sent :(");
                }
            });
        } else {
            // Unable to retrieve node with transcription capability
            //System.out.println("no nodes :((");
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
                    JSONObject json = craftJSON();

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

    private void initView() {
        heartBeatSlider = findViewById(R.id.heartBeatSlider);
        systolicSlider = findViewById(R.id.systolicSlider);
        diastolicSlider = findViewById(R.id.diastolicSlider);

        heartBeatSlider.setMax((MAX_HEART_BEAT - MIN_HEART_BEAT)/STEP);
        systolicSlider.setMax((MAX_SYSTOLIC - MIN_SYSTOLIC)/STEP);
        diastolicSlider.setMax((MAX_DIASTOLIC - MIN_DIASTOLIC)/STEP);

        heartBeatIndicator = findViewById(R.id.heartBeatIndicator);
        pressureIndicator = findViewById(R.id.pressureIndicator);

        heartBeatSlider.setProgress(60);
        diastolicSlider.setProgress(35);
        systolicSlider.setProgress(40);

        heartBeatIndicator.setText(String.valueOf(heartBeatSlider.getProgress()));
        pressureIndicator.setText((diastolicSlider.getProgress() + MIN_DIASTOLIC )+ " / " + (systolicSlider.getProgress() + MIN_SYSTOLIC));
    }

    void setListeners() {
        heartBeatSlider.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                heartBeatIndicator.setText(String.valueOf(heartBeatSlider.getProgress() + MIN_HEART_BEAT));
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {

            }

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {
                //TODO change the value of the infopacket here
            }
        });

        diastolicSlider.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                pressureIndicator.setText((diastolicSlider.getProgress() + MIN_DIASTOLIC )+ " / " + (systolicSlider.getProgress() + MIN_SYSTOLIC));
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {

            }

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {

            }
        });

        systolicSlider.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                pressureIndicator.setText((diastolicSlider.getProgress() + MIN_DIASTOLIC )+ " / " + (systolicSlider.getProgress() + MIN_SYSTOLIC));
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {

            }

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {

            }
        });
    }

    private JSONObject craftJSON() throws JSONException {
        JSONObject json = new JSONObject();

        String ts = MakeInfopacket.craftTimeStamp();
        String macAddr = MakeInfopacket.getMacAddress(getApplicationContext());
        String geoX = MakeInfopacket.getGeoX();
        String geoY = MakeInfopacket.getGeoY();

        json.put("heartRate", heartBeatSlider.getProgress() + MIN_HEART_BEAT);
        json.put("systolic", systolicSlider.getProgress() + MIN_SYSTOLIC);
        json.put("diastolic", diastolicSlider.getProgress() + MIN_DIASTOLIC);
        json.put("ts", ts );
        json.put("macAddr", "AAAAAAAAAAAA");
        json.put("geoX", geoX);
        json.put("geoY", geoY);
        return json;

    }

}
