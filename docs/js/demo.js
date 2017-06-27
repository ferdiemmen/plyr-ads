
(function() {

  let player = plyr.setup();
  let advertisement1 = PlyrAds.setup(player[0], {
    adTagUrl: 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=',
    type: 'ima',
    skipButton: {
      delay: 5
    }
  });
  let advertisement2 = PlyrAds.setup(player[1], {
    adTagUrl: 'https://www.youtube.com/watch?v=VNRuzCohElk',
    type: 'youtube'
  });

})();