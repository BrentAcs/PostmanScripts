const echoPostRequest = {
  url: pm.environment.get("idp_base_url") + "/as/token.oauth2", 
  method: 'POST',
      header: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: {
          mode: 'urlencoded',
          urlencoded: [
            {key: "grant_type", value: "password", disabled: false},
            {key: "username", value: pm.environment.get("username"), disabled: false},
            {key: "password", value: pm.environment.get("password"), disabled: false},
            {key: "client_id", value: pm.environment.get("client_id"), disabled: false},
            {key: "client_secret", value: pm.environment.get("client_secret"), disabled: false},
            {key: "scope", value: 'openid profile agreement freight invoice order order.submit product quote quote.create renewal servicelevel', disabled: false}
        ]
      }
};

Utils = {
  needsAccessToken: function() {
    var getToken = true;
    if (!pm.environment.get('accessTokenExpiry') || !pm.environment.get('access_token')) {
      console.log('Token or expiry date are missing')
    } else if (pm.environment.get('accessTokenExpiry') <= (new Date()).getTime()) {
      console.log('Token is expired')
    } else {
      getToken = false;
      console.log('Token and expiry date are all good');
    }
    return getToken;
  },

  verifyAuthToken: function() {
    if( Utils.needsAccessToken() ){
      pm.sendRequest(echoPostRequest, function (err, res) {
        console.log(err ? err : res.json());
        if (err === null) {
          console.log('Saving the token and expiry date')
          var responseJson = res.json();
          pm.environment.set('access_token', responseJson.access_token)

          var expiryDate = new Date();
          expiryDate.setSeconds(expiryDate.getSeconds() + responseJson.expires_in);
          pm.environment.set('accessTokenExpiry', expiryDate.getTime());
        }
      });
    }
  },

  initEnvVariables: function() {
    var moment = require('moment')

    var lastMonthStartDate = moment().subtract(1, "months").format("YYYY-MM-DD hh:mm:ss");
    var lastWeekStartDate = moment().subtract(1, "weeks").format("YYYY-MM-DD hh:mm:ss");
    var last3DaysStartDate = moment().subtract(1, "weeks").format("YYYY-MM-DD hh:mm:ss");
    var lastMonthEndDate = moment().format("YYYY-MM-DD hh:mm:ss");
    var lastWeekEndDate = moment().format("YYYY-MM-DD hh:mm:ss");
    var last3DaysEndDate = moment().format("YYYY-MM-DD hh:mm:ss");

    pm.environment.set('lastMonthStartDate', lastMonthStartDate);
    pm.environment.set('lastMonthEndDate', lastMonthEndDate);
    pm.environment.set('lastWeekStartDate', lastWeekStartDate);
    pm.environment.set('lastWeekEndDate', lastWeekEndDate);
    pm.environment.set('last3DaysStartDate', last3DaysStartDate);
    pm.environment.set('last3DaysEndDate', last3DaysEndDate);
  },

  createDateTimeStamp: function(prefix){
    var moment = require('moment')
    return prefix + moment().format('-MM-DD-HH-MM-SS');
  },

  addRequiredDFHeaders: function(site, lang){
    var Header = require('postman-collection').Header;

    site ??= 'US';
    lang ??= 'en-US';

    pm.request.headers.add(new Header('Site: ' + site));
    pm.request.headers.add(new Header('Accept-Language: ' + lang));
  }
};

//Utils.initEnvVariables();
//Utils.addRequiredDFHeaders();
//Utils.verifyAuthToken();