
(function(Plyr, PlyrAds) {

  window.player = new Plyr(document.querySelectorAll('.js-player'));

  window.ads = PlyrAds.init(window.player, {
    // adTagUrl: 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=',
    // adTagUrl: 'https://go.aniview.com/api/adserver6/vast/?AV_PUBLISHERID=58c25bb0073ef448b1087ad6&AV_CHANNELID=5a0458dc28a06145e4519d21&AV_URL=https://localhost&cb=1510865475441&AV_WIDTH=640&AV_HEIGHT=480',
    // adTagUrl: 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=&impl=s&gdfp_req=1&env=vp&output=xml_vmap1&unviewed_position_start=1&cust_params=sample_ar%3Dpremidpostpod%26deployment%3Dgmf-js&cmsid=496&vid=short_onecue&ad_rule=1&correlator=',
    adTagUrl: 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&ad_rule=1&impl=s&gdfp_req=1&env=vp&output=vmap&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ar%3Dpremidpost&cmsid=496&vid=short_onecue&correlator=',
    debug: true
  });

})(window.Plyr, window.PlyrAds);
