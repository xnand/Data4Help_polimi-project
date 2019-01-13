class UriFactory {
  String _scheme;
  String _host;
  int _port;


  UriFactory(String scheme, String host, int port ) {
    this._scheme = scheme;
    this._host = host;
    this._port = port;
  }


  Uri createUri(String _path) {
    return new Uri(
      host: _host,
      port: _port,
      scheme: _scheme,
      path: _path
    );
  }

}