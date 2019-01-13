import 'dart:core';
import 'package:flutter/services.dart';
import 'package:trackmemobile/ProfileManager/profileStateManager.dart';

// a singleton class to manage channel communication
class ChannelController {
  static final ChannelController _packetManager = new ChannelController._internal();
  factory ChannelController() {
    return _packetManager;
  }
  ChannelController._internal();

  static const _oneSec = Duration(milliseconds: 1000);
  final _platform =   MethodChannel('com.trackme.trackmemobile/packet');
  bool _isInit = false;
  bool _isRunning = false;

  //start the manager service on the platform
  void startPacketManagerService() {
    _isRunning = true;
    _platform.invokeMethod('setupPacketHandler')
        .catchError((e) {
          _isRunning = false;
          print("error starting the service : ${e.error}");

    });
    _startSendingPacket();
  }

  //start sending packet to the server
  void _startSendingPacket() async {
    _platform.invokeMethod("startService", <String, String> {
      'SSN' : await ProfileManager().getSSN(),
      'email' : await ProfileManager().getEmail(),
      'password' : await ProfileManager().getPassword()
    });
  }

  Future<String> getMacAddr() async {
    String str = await _platform.invokeMethod("getMacAddr");
    return str;

  }

}