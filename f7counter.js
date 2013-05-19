Players = new Meteor.Collection("players");
Highscore = new Meteor.Collection("highscore");

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
    if (ev.which === keyCode || Session.equals("cheat", true)) {
      if (Session.get("player")) {
        Players.update(Session.get("player"), {$inc: {score: 1}});
        var player = Players.findOne(Session.get("player"));
        var personal_best = Highscore.findOne(Session.get("player"));
        console.log("player score:", player.score);
        console.log("personal_best", personal_best)
        if (!personal_best) {
          console.log("No previous highscore for player");
          Highscore.insert({"_id": player._id, "name": player.name, "score": player.score, "date": new Date() })
        } else if (personal_best.score < player.score) {
          Highscore.update(Session.get("player"), {$set: {"score": player.score, "date": new Date() } });
        }
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
      return scoreToLevel(player.score);
    }
  };

  Template.scores.players = function () {
    return Players.find({}, {sort: {score: -1, name: 1}});
  };

  Template.highscore.players = function () {
    return Highscore.find({}, {sort: {score: -1, name: 1}});
  };

  Template.list_player.selected = function () {
    return Session.equals("player", this._id) ? "success" : '';
  };
  Template.list_player.level = function () {
    return scoreToLevel(this.score);
  };
  Template.list_player.date = function () {
    if (!this.date) {
      return "";
    }
    var day = this.date.getFullYear() + "-0" + this.date.getMonth() + "-" + this.date.getDate(),
        time = this.date.getHours() + ":" + this.date.getMinutes() + ":" + this.date.getSeconds();
    return day + " " + time;
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
    'click .remove_player': function () {
      console.log("removing player", Session.get('player'));
      if (Session.get('player')) {
        Players.remove(Session.get('player'));
        Highscore.remove(Session.get('player'));
        Session.set('player', undefined);
      }
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
