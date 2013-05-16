Players = new Meteor.Collection("players");

var scoreToLevel = function (score) {
  return parseInt(score/100, 10);
};
var levelToString = function (level) {
  var level_string = { 0: 'A', 1: 'AC', 2: 'C', 3: 'SrC', 4: 'SM', 5: 'M', 6: 'SrM', 7: 'P'};
  var level_as_string = level_string[level];
  if (level_as_string) {
    return level_as_string;
  } else {
    return "Champion!";
  }
};
var levelToImage = function (level) {
  var level_image = {
    0: {'image': '', 'name': ''},
    1: {'image': '/amni.jpg', 'name': 'Amanda'},
    2: {'image': '/inny.jpg', 'name': 'Ingela'},
    3: {'image': '/arsy.jpg', 'name': 'Ardian'},
    4: {'image': '/anoh.jpg', 'name': 'Anna'}
    //5: {'image': '/amni.jpg', 'name': ''},
    //6: {'image': '/amni.jpg', 'name': ''},
    //7: {'image': '/jocke.jpg', 'name': ''}
  };
  var level_as_string = level_image[level];
  if (level_as_string) {
    return level_as_string;
  } else {
    return {'image': '/jocke.jpg', 'name': 'Jocke'}
  }
};
var scoreToString = function (score) {
  return levelToString(scoreToLevel(score));
};
var scoreToImage = function (score) {
  return levelToImage(scoreToLevel(score));
};

if (Meteor.isClient) {
  // Init
  // TODO: Change to keycode for F7
  var keyCode = 118;

  $(document).bind("keyup", function(ev){
    if (typeof console !== 'undefined') {
      console.log("pressed key code:", ev.which);
    }
    if (ev.which === keyCode) {
      if (Session.get("player")) {
        Players.update(Session.get("player"), {$inc: {score: 1}});
        var player = Players.findOne(Session.get("player"));
        console.log("player score:", player.score);
      }
    }
  });

  Template.player.player = function () {
    var player = Players.findOne(Session.get("player"));
    if (player) {
      return player.name;
    } else {
      return "No player selected - select from the list below"
    }
  };
  Template.player.pepp_image_src = function () {
    var player = Players.findOne(Session.get("player"));
    if (player) {
      var image_obj = scoreToImage(player.score);
      return image_obj.image;
    }
  };
  Template.player.pepp_name = function () {
    var player = Players.findOne(Session.get("player"));
    if (player) {
      var image_obj = scoreToImage(player.score);
      if (image_obj.name != "") {
        return image_obj.name +  " Says You're The Inspiration "+ player.name +"!";
      }
    }
  };
  Template.player.score = function () {
    var player = Players.findOne(Session.get("player"));
    if (player) {
      return player.score;
    }
  };
  Template.player.level = function () {
    var player = Players.findOne(Session.get("player"));
    if (player) {
      return scoreToString(player.score);
    }
  };

  Template.highscore.players = function () {
    return Players.find({}, {sort: {score: -1, name: 1}});
  };

  Template.list_player.selected = function () {
    return Session.equals("player", this._id) ? "success" : '';
  };
  Template.list_player.level = function () {
    return scoreToString(this.score);
  };
  Template.list_player.events({
    'click': function () {
      Session.set("player", this._id);
      console.log("new player id:", Session.get("player"));
    }
  });

  Template.add_player.events({
    'click .toggle_add_player_form': function () {
      $(".add_player_form").toggle();
    },
    'click #submit_player': function (ev) {
      ev.preventDefault();
      Players.insert({name: $("#new_player_name").val(), score: 0});
    }
  });

}

/**
 * SERVER
 */
if (Meteor.isServer) {

  Meteor.startup(function () {
    // code to run on server at startup
    if (Players.find().count() === 0) {
      var db_init_Players = [{name: "Wille"},
                             {name: "Henrik"},
                             {name: "Albin"}];
      for (var i = 0; i < db_init_Players.length; i++) {
        var player = db_init_Players[i];
        Players.insert({name: player.name, score: 0, level: 1});
      }
    }
  });

  Meteor.setInterval(function () {
    var players = Players.find({});
    players.forEach(function (player) {
      if (player.score > 0) {
        Players.update(player._id, {$inc: {score: -1*(1+parseInt(player.score/100, 10) )}});
      }
    });
  }, 1000);
}
