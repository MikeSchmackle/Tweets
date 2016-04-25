Tables = new Meteor.Collection('tweets');

if (Meteor.isClient) {
  Template.navItems.helpers({
    activeIfTemplateIs: function (template) {
      var currentRoute = Router.current();
      return currentRoute &&
        template === currentRoute.lookupTemplate() ? 'active' : '';
    }
  });
  Template.articles.helpers({
    maybeSelected: function () {
      var currentRoute = Router.current();
      return currentRoute &&
        this._id === currentRoute.params._id ? 'selected' : '';
    }
  });

  Template.application.rendered = function (){
       $('.input-group-addon').addClass("input-sm");
       $('.reactive-table-input').addClass("input-sm");
       $('.form-control').addClass("input-sm");
       $('#pnlTweet').hide();
  };

  Template.application.helpers({
   tables : function () {
     return Tables;
   },

   tableSettings : function () {
     return {
       rowsPerPage: 10,
       showNavigation: 'auto',
       showColumnToggles: false,
       fields: [
         { key: 'tweet', label: 'Tweets', fn: function(_id){
           tVals = _id.split("~");
           return new Spacebars.SafeString('<a href="https://twitter.com/WhiteRhinoTour/status/' + tVals[1] + '">'+ tVals[0]+ '</a>'); }  }
       ]
      }
    }
   });
  //  $('#"btnRetrieveTweets').attr('disabled','true').val('loading...');
  Template.application.helpers({
    counts: [
      { amt: 10 },
      { amt: 25 },
      { amt: 50 },
      { amt: 75 },
      { amt: 100}
    ]
  });

  Template.application.helpers({
    theUN: function () {
      return Session.get("un");
    }
  });

  Template.application.events({

    'click #btnRetrieveTweets' : function () {

			console.log("Recent tweets from stream!");

      $(".Results").hide();

			userName = $('#userName').val();
      cnt      = $('#feed_count').val();
      uRL      = "https://api.twitter.com/1.1/statuses/user_timeline.json?include_entities=true&include_rts=true&screen_name="+userName+"&count="+cnt;

      Session.set("un", userName);

      Meteor.call('checkTwitter', uRL, function(err, respJson) {
				if(err) {
					window.alert("Error: " + err.reason);
					console.log("error occured on receiving data on server. ", err );
				} else {
					console.log("respJson: ", respJson);
          $('#pnlTweet').show();
				//	window.alert(respJson.length + ' tweets received.');

        //  $('#"btnRetrieveTweets').attr('disabled','false').val('Get Tweets...');
				}
			});
    },
  });

};

if (Meteor.isServer) {

    Meteor.methods({

    checkTwitter: function(url) {

        this.unblock();

        try {

          var base64AuthToken = new Buffer("zveWoJ2L34fqWLWnkw2CqEfct:Nht95q49xmjU1EqOFDFJLdK1suHAbGW3bh4cTz4IgpvSR0xGgi").toString('base64');

          /* Obatin Bearer Token */
          var auth_url = 'https://api.twitter.com/oauth2/token';
          var result = HTTP.call("POST",auth_url, {

            params: {
              'grant_type': 'client_credentials'
            },
            headers: {
              'Authorization': 'Basic ' + base64AuthToken,
              'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            }

          });

          var Token_JSON = JSON.parse(result.content);

          /* Obtain Twitter Feeds*/

          var bearer = 'bearer ' + Token_JSON.access_token;
          var oAuth = 'OAuth oauth_consumer_key="zveWoJ2L34fqWLWnkw2CqEfct", oauth_nonce="5c9cf9502820ee56ed82d36f7f926936", oauth_signature="fSber5ID4I0zP70%2BhPR27bITLjs%3D", oauth_signature_method="HMAC-SHA1", oauth_timestamp="1427299928", oauth_token="46678339-3EZeUlyjqqQtgJMfzrTCzxa43Qp3ngUJcqHc7kCRF", oauth_version="1.0"'

          var Feeds_Result = HTTP.call("GET",url, {headers:{'Authorization':bearer}});

          var respJson = JSON.parse(Feeds_Result.content);

          //if (! Tweets.findOne()){
          //  Tweets.remove();
          //}

          Tables.remove({});

          for(var i = 0; i < respJson.length; i++) {
            Tables.insert({
              tweet: respJson[i].text+"~"+respJson[i].id_str
            });
            //	console.log("Tweet Source: ", respJson[i].source );
          }

		      return respJson;

        } catch (e) {
                // Got a network error, time-out or HTTP error in the 400 or 500 range.
          return Token_JSON;
          }
        }       //End Try
    })          //End Startup
  }
