/* globals OO: false, YT: false */
var App = require('../app').instance;

App.VideoView = Ember.View.extend({
  templateName: 'video'

, tagName: 'main'

, classNames: ['content']

, classNameBindings: ['hasVideo', 'isLoadingVideoPlayer', 'videoType']

, videoType: function () {
    return 'show-'+this.get('videoProvider');
  }.property('videoProvider')

, animateOverlay: function () {
    if (this.get('isLoadingVideoPlayer')) {
      console.log('enter');
      this.$().removeClass('animate-title-exit').addClass('animate-title-enter');
    } else {
      this.animationTimer = Ember.run.later(this, function() {
        this.$().removeClass('animate-title-enter').addClass('animate-title-exit');
      }, 500);
    }
  }.observes('isLoadingVideoPlayer')

, onEpisodeChange: function () {
    this.set('hasVideo', !!(this.get('controller.currentEpisode')));
    this.createVideoPlayer();
  }.observes('controller.currentEpisode').on('didInsertElement')

, createVideoPlayer: function () {
    if (window.ENV.fastDev) return console.log('stubbing player');

    this.videoPlayer && this.videoPlayer.pause && this.videoPlayer.pause();
    this.ytPlayer && this.ytPlayer.pauseVideo && this.ytPlayer.pauseVideo();

    var episode = this.get('controller.currentEpisode');
    if (!episode) return;

    if (episode.videoId || episode.youtubeId) this.set('isLoadingVideoPlayer', true);

    if (episode.videoId) {
      this.createOOPlayer(episode.videoId);
      this.set('videoProvider', 'oo-player');
    } else if (episode.youtubeId) {
      this.createYTPlayer(episode.youtubeId);
      this.set('videoProvider', 'youtube-player');
    } else {
      var url = 'http://www.vice.com'+episode.path;
      var html = '<div class="no-video-msg"">No video found, watch on vice.com?<br><a target="_blank" href="'+url+'">'+url+'</a></div>';
      this.$('.no-video-msg').remove();
      this.$().append(html);
    }

  }

, createOOPlayer: function (videoId) {
    var self = this;
    var controller = this.get('controller.controllers.sidebar');
    var onCreate = function(player) {
      self.set('isLoadingVideoPlayer', false);
      player.subscribe(OO.EVENTS.PLAYED,'m', function() {
        controller.send('onVideoEnd');
      });
      player.subscribe(OO.EVENTS.PLAYBACK_READY, 'm', function () {
        self.get('controller').send('saveVideoDuration', player.duration);
      });
    };
    if (this.videoPlayer) {
      self.set('isLoadingVideoPlayer', false);
      this.videoPlayer.setEmbedCode(videoId, {
        autoplay: true,
        'google-ima-ads-manager': {
          showInAdControlBar:true,
          adTagUrl:adsurl
        },
      });
    } else {
      var adsurl = this.getGoogleadsUrl(videoId);
      this.videoPlayer = OO.Player.create('video-area', videoId, {
        'google-ima-ads-manager': {
          showInAdControlBar:true,
          adTagUrl:adsurl
        },
        height:'100%',
        width:'100%',
        wmode:'opaque',
        autoplay:true,
        onCreate:onCreate
      });
    }
  }

, getGoogleadsUrl: function(ooyalaId){
    var playerId = 'YjMwNmI4YjU2MGM5ZWRjMzRmMjljMjc5',
        cmsId = this.getVideoPlayerCmsId(playerId),
        iu = '16916245/vice.com',
        googleAdsUrl = 'http://pubads.g.doubleclick.net/gampad/ads?sz=1920x1080&iu=' + iu + '&impl=s&gdfp_req=1&env=vp&output=xml_vast2&unviewed_position_start=1&url=[referrer_url]&cmsid=' + cmsId + '&correlator=[timestamp]&cust_params=&vid=' + ooyalaId + '&contentId=' + ooyalaId;
    return googleAdsUrl;
}

,getVideoPlayerCmsId: function(player_id) {
    var map = {
        165: ["ed5eb0b71f8741c69b07b49cccbdaaf5", "MDMxYmI0ZjI5MjRjZmQ5OGY2ZDQ5Yzc1", "ODdhNGMwYzA2ZjhhNWU4Yzc1MGZjZGRk", "d928402e996341c58a6404b686e5378e", "d5de9686de2848258342ce4d62190e8e", "3589c16eaba74fb0be5ee94af87f6892", "3fba4ebcdd6c4f55b259f63a338d707c", "4bcf32cc584945a085509811408a794b", "243053cebb074fab9a4fa3b107d9401b", "c3828297e53448c1a2610fd10f1f7f4b", "c7f8b22f05bf48b498a210d4d6a44792", "6cd706bec16c4c83b6a3ef626ed1fae0", "39b6ae32dce84518b7e0001233dacb86", "b19be36678cd4bd58e203bb307e06bdb", "ee9bc902a5bb499e9b13fe722ada4942", "YzhmNGU3NWZhN2Y2ZjM1ZDk0ZGEyODlj", "18845919db174b5aa7feacb4a19a5a5e", "5d62cb6754d84f1c9c11d805f4ea55eb", "489146d358e644ef8da55db29160835d", "2d1783dad1c04e37810a2666230d6169", "d3b066a71ec94b2586c1bc3d51f656d8", "278e806a09e443489938524a340ef1c1", "731767b822224b4287696baa5212a5e4", "f5e08d38328a40288636347bc12a68d4", "YzU4NTUyOWMzMjY3M2MxYjUzODAyZDM4", "MjM2MTExZDE0MmQ4MjQxYTcxZDE2NTk3", "e3711138e37e45759a1fbc8d268baaf0", "e6404905b6d248e38d6853d6c3182bee", "9d225a440dd44203bae31160ef249b2b", "2b4ad6058c614d5a9867c9ba4d1a7b38"],
        645: ["MWRjYzM3ZmI0Y2Q1NWFjYWU0OTFmNGUx", "NmQ2OTU2ZWY5ZmU2YTc0YTkzMWY1YmE0"],
        285: ["f6259cf1281c4422b1477277dadcfd36", "9edf6100d4204ce784bbffa5fb979ff4"],
        765: ["NDJmMDczNzNhNGViNGYwNzI3MjkwOGRk", "YmM3ZjMxODc5Mzk1MGJhN2Y4MDZjNDI5"],
        525: ["296cb303c5834a6bb80548588fd86132", "b60484eb123e4852b4350ad0e35fab36", "270342259cbd4802a61d3deb009507ca", "NDA0MWZiMDUwNWYwNWFiZGQ1YTI5ZjZj", "afe2f4b9eab49c2a1d1d19ebbe491be", "7c2f49d7e24140a28b55282f0feff710", "MTllNzA1MWUzYTkxYjZiNjU2MWNmMDJj", "1af9680b605746d791d3a3788d6ced71", "806c9d19b4214fcc8c98468be12b61c4", "ef44446e9cac4b828f96fb8f3e255e75", "6d67a6dabc79435aab18db90858c2198", "OGEyMjk1ZDE0MDY3MWNkODk4M2ZmN2U0", "OTdiY2NlOGMzZWNmMDU0MjA4YmFmY2Fm", "bfa170cb04494148ba2106c7057fd239", "MGQzMzAwZjY4NjE4NTFjN2JhNGUxYWVi"],
        885: ["OTk0ZjU0YzZhMGU4OTRlNjBlNDIzNTNh", "10e559909530470fbc79c07a95f7bc77", "d951fe9a472b4ed39c5c34843bbb273d", "ODlhYTRkNGM4NzQwYmRkZGYyYzc0YWVk", "N2ZhYzJlMTVmM2U4YjE0NGU2MGZjMWU3", "34f3bfe8a0f5425d8af6c89fe47bdb06", "YjFmODE3MmQwOTU3MTUxODE4M2NjNTM5", "ZjhjNDk2Mzc1M2VmYzFhMjAwNjYxZDRl", "6f565a52cd4123b36d3648b2374261", "ee52aaf904a64786b3ff54c7e7c0ea17", "NjI1ZDcxYjA2NjE5M2Q1YmM3ZTMxYjRk", "ZDQ5MmI4Y2UwYTdjNGMxZTA2YmUxNWU1", "NjI0MWM5NThmZjkzMWY5NzlmYzYwZmMx", "8290ed1f2b3b44378b7695f8c0769684", "a30a1d6c7f43425daae642f1f04b475a", "bc2fb0a42e7c4abd9ccb12a93ffa9335", "d5207f3e592a4de79ee304dbadf35596", "MTU1NDZmYTM5NzhjODk3NDIzYzdmOGZh", "NDYzN2M2ZWU1NjMxNzI1OWNkNzk2Y2M2", "YzU3OThlOGE3ZjI5MjUxYWQ3NmQ2OGQx", "MjBjOGU5ZjQ1NTdhZTQ0MzAyMDY2YzE5", "MTNjM2JjMjE4NTc0OGFlMzZhOGJhZGE3", "b9cfd846cb7d4500be8b7825d88dbb61", "69b347b337524dc7ac6639e7feddbe9d", "NmZjNjgwY2FhN2Q3ZmFjMDI1OWUxYmMy"],
        405: ["1919aeda1509459eae0d0d6bc6041baa", "1510332f702341c782ed61e3ea8e7185", "36d0d8b4d1fd4c5daeba0a9f912c6bdd", "3c973f4a15154a16878c482fddbb64d6", "5203e6e2bfd6497b81ffef86abec9516", "c8cee4ab156a4146b45276366aff17a8", "YjMwNmI4YjU2MGM5ZWRjMzRmMjljMjc5"]
    }, keys = [];

    for (var id in map) {
        var arr = map[id];

        keys.push(id);

        for (var i = 0, len = arr.length; i < len; i++) {
          if (player_id === arr[i]) return id;
        }
    }

    return keys[0];
}

, createYTPlayer: function (youtubeId) {
    var controller = this.get('controller.controllers.sidebar');

    if (this.ytPlayer) {
      return this.ytPlayer.loadVideoById(youtubeId);
    }

    this.ytPlayer = new YT.Player('youtube-area', {
      height: '100%',
      width: '100%',
      videoId: youtubeId,
      playerVars: { html5: 1, autoplay: 1, autohide: 1 },
      events: {
        'onReady': function () {
          this.set('isLoadingVideoPlayer', false);
          this.get('controller').send('saveVideoDuration', this.ytPlayer.getDuration());
        }.bind(this)
      , 'onStateChange': function (e) {
          if(e.data === 0) controller.send('onVideoEnd');
        }
      }
    });
  }

});
