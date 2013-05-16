Players = new Meteor.Collection("players");

if (Meteor.isClient) {
  // Init
  // TODO: Change to keycode for F7
  var keyCode = 65;

  $(document).bind("keydown", function(ev){
    if (typeof console !== 'undefined') {
      console.log("pressed key code:", ev.which);
    }
    if (Session.get("player")) {
      Players.update(Session.get("player"), {$inc: {score: 5}});
    }
    //if (ev.which === keyCode) {
        //ev.preventDefault();
        //Session.set("counter", Session.get("counter")+1);
    //}
  });

  Template.player.player = function () {
    var player = Players.findOne(Session.get("player"));
    if (player) {
      return player.name;
    } else {
      return "No player selected - select from the list below"
    }
  };
  Template.player.score = function () {
    var player = Players.findOne(Session.get("player"));
    if (player) {
      return player.score;
    }
  };
  Template.player.level = function () {
    return Session.get("level");
  };

  Template.highscore.players = function () {
    return Players.find({}, {sort: {score: -1, name: 1}});
  };

  Template.list_player.selected = function () {
    return Session.equals("player", this._id) ? "success" : '';
  };
  Template.list_player.events({
  'click': function () {
    Session.set("player", this._id);
    console.log("new player id:", Session.get("player"))
  }
});

}

if (Meteor.isServer) {

  Meteor.startup(function () {
    // code to run on server at startup
    if (Players.find().count() === 0) {
      var db_init_Players = [{name: "Wille"},
                             {name: "Henrik"},
                             {name: "Albin"}];
      for (var i = 0; i < db_init_Players.length; i++) {
        var player = db_init_Players[i];
        Players.insert({name: player.name, score: 0});
      }
    }
  });

  Meteor.setInterval(function () {
    var players = Players.find({});
    players.forEach(function (player) {
      if (player.score > 0) {
        Players.update(player._id, {$inc: {score: -1}});
      }
    });
  }, 1000);
}
