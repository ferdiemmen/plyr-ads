
(function(Plyr, PlyrAds) {

  window.player = new Plyr(document.querySelectorAll('.js-player'));

  window.ads = PlyrAds.init(window.player, {
    // VPAID 2.0 Linear
    //adTagUrl: 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinearvpaid2js&correlator=',
    // SpotX VAST 2.0 / VPAID JS with play/pause
    // adTagUrl: 'http://search.spotxchange.com/vast/2.0/85394?VPAID=JS&content_page_url=search.spotxchange.com&cb=1&player_width=640&player_height=480',
    // VI example tag
    adTagUrl: 'http://go.aniview.com/api/adserver6/vast/?AV_PUBLISHERID=58c25bb0073ef448b1087ad6&AV_CHANNELID=5a0458dc28a06145e4519d21&AV_URL=127.0.0.1:3000&cb=1&AV_WIDTH=640&AV_HEIGHT=480',
    // adTagUrl: 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=',
    // adTagUrl: 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=&impl=s&gdfp_req=1&env=vp&output=xml_vmap1&unviewed_position_start=1&cust_params=sample_ar%3Dpremidpostpod%26deployment%3Dgmf-js&cmsid=496&vid=short_onecue&ad_rule=1&correlator=',
    // adTagUrl: 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&ad_rule=1&impl=s&gdfp_req=1&env=vp&output=vmap&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ar%3Dpremidpost&cmsid=496&vid=short_onecue&correlator=',
    // adTagUrl: 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinearvpaid&correlator=',
    debug: true,
  });

  window.ads.on('ALL_ADS_COMPLETED', function() {
    console.log('ALL_ADS_COMPLETED');
  });

  window.ads.on('COMPLETE', function() {
    console.log('COMPLETE');
  });

})(window.Plyr, window.PlyrAds);
