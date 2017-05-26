spa.shell = (function(){
  var configMap = {
    anchor_schema_map :{
      chat : {opened : true, closed : true}
    },
    main_html : String()
              + '<div class="spa-shell-head">'
              + '<div class="spa-shell-head-logo">'
              + '<h1>SPA</h1>'
              + '<p>javascript end to end</p>'
              + '</div>'
              + '<div class="spa-shell-head-acct"></div>'
              //+ '<div class="spa-shell-head-search"></div>'
              + '</div>'
              + '<div class="spa-shell-main">'
              + '<div class="spa-shell-main-nav"></div>'
              + '<div class="spa-shell-main-content"></div>'
              + '</div>'
              + '<div class="spa-shell-foot"></div>'
              + '<div class="spa-shell-modal"></div>',
    chat_extend_time : 1000,
    chat_retract_time : 300,
    chat_extend_height : 450,
    chat_retract_height : 15,
    chat_extended_title : 'click to retract',
    chat_retracted_title : 'click to extend'
  },
  stateMap = {
    $container : null,
    anchor_map : {},
    is_chat_retracted : true
  },
  jqueryMap = {},
  setJqueryMap, toggleChat, onClickChat, initModule,
  copyAnchorMap, setChatAnchor, changeAnchorPart, onHashchange,
  onTapAcct, onLgoin, onLogout;

  copyAnchorMap = function(){
    return $.extend(true, {}, stateMap.anchor_map);
  };

  changeAnchorPart = function(arg_map){
    var anchor_map_revise = copyAnchorMap(),
        bool_return = true,
        key_name, key_name_dep;
    KEYVAL:
    for(key_name in arg_map){
      if(arg_map.hasOwnProperty(key_name)){
        if(key_name.indexOf('_') === 0){
          continue KEYVAL;
        }
        anchor_map_revise[key_name] = arg_map[key_name];
        key_name_dep = '_' + key_name;
        if(arg_map[key_name_dep]){
          anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
        }else {
          delete anchor_map_revise[key_name_dep];
          delete anchor_map_revise['_s' + key_name_dep];
        }
      }
    }

    try{
      $.uriAnchor.setAnchor(anchor_map_revise);
    }catch(error){
      $.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
      bool_return = false;
    }
    return bool_return;
  };

  onHashchange = function(){
    var anchor_map_previous = copyAnchorMap(),
        anchor_map_proposed,
        _s_chat_previous,
        _s_chat_proposed,
        s_chat_proposed,
        is_ok = true;
    try{
      anchor_map_proposed = $.uriAnchor.makeAnchorMap();
    }catch(error){
      $.uriAnchor.setAnchor(anchor_map_previous, null, true);
      return false;
    }

    stateMap.anchor_map = anchor_map_proposed;
    _s_chat_previous = anchor_map_previous._s_chat;
    _s_chat_proposed = anchor_map_proposed._s_chat;
    if(!anchor_map_previous || _s_chat_previous !== _s_chat_proposed){
      s_chat_proposed = anchor_map_proposed.chat;
      switch (s_chat_proposed) {
        case 'opened':
          is_ok = spa.chat.setSliderPositon('opened');
          break;
        case 'closed':
          is_ok = spa.chat.setSliderPositon('closed');
          break;
        default:
          spa.chat.setSliderPositon('closed');
          delete anchor_map_proposed.chat;
          $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
      }
    }
    if(!is_ok){
      if(anchor_map_previous){
        $.uriAnchor.setAnchor(anchor_map_previous,null,true);
        stateMap.anchor_map = anchor_map_previous;
      }else {
        delete anchor_map_proposed.chat;
        $.uriAnchor.setAnchor(anchor_map_proposed,null,true);
      }
    }
    return false;
  };

  setChatAnchor = function(postion_type){
    return changeAnchorPart({chat : postion_type});
  };

  setJqueryMap = function(){
    var $container = stateMap.$container;
    jqueryMap = {
      $container : $container,
      $acct : $container.find('.spa-shell-head-acct'),
      $nav : $container.find('.spa-shell-main-nav')
    };
  };

  onTapAcct = function(event){
    var acc_text, user_name, user = spa.model.people.get_user();
    if(user.get_is_anon()){
      user_name = prompt('Please sign-in');
      spa.model.people.login(user_name);
      jqueryMap.$acct.text('... processing ...');
    }else{
      spa.model.people.logout();
    }
  };

  onLogin = function(event, login_user){
    jqueryMap.$acct.text(login_user.name);
  };

  onLogout = function(event, logout_user){
    jqueryMap.$acct.text("Please sign-in");
  }

  onClickChat = function(event){
    //if(toggleChat(stateMap.is_chat_retracted)){
    //  $.uriAnchor.setAnchor({
    //    chat : (stateMap.is_chat_retracted ? 'open' : 'closed')
    //  });
    //}
    changeAnchorPart({
      chat : (stateMap.is_chat_retracted ? 'open' : 'closed')
    });
    return false;
  }
  initModule = function($container){
    stateMap.$container = $container;
    $container.html(configMap.main_html);
    setJqueryMap();
    stateMap.is_chat_retracted = true;

    $.uriAnchor.configModule({
      schema_map : configMap.anchor_schema_map
    });
    spa.chat.configModule({
      set_chat_anchor : setChatAnchor,
      chat_model : spa.model.chat,
      people_model : spa.model.people
    });
    spa.chat.initModule(jqueryMap.$container);
    $(window).bind('hashchange', onHashchange)
             .trigger('hashchange');
    $.gevent.subscribe($container, 'spa-login', onLogin);
    $.gevent.subscribe($container, 'spa-logout', onLogout);
    jqueryMap.$acct.text('Please sign-in')
                   .bind('click', onTapAcct);

  }

  return {initModule: initModule};
})();
