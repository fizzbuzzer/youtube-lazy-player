(function() {
  const PLAYER_API_SRC = 'https://www.youtube.com/player_api';
  const WIDGET_SELECTOR = "[data-widget='yt-lazy-player']";
  const SHADOW_DOM = `
    <style>
    :host {
      position: relative;
      display: inline-block;
    }
    :hover {
      cursor: pointer;
    }
    .wrapper {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
    }
    .icon {
      position: absolute;
      left: calc(50% - 34px);
      top: calc(50% - 24px);
      width: 68px;
      height: 48px;
    }
    .icon-bg {
      fill: #212121;
      fill-opacity: 0.5;
      transition: fill-opacity .25s cubic-bezier(0,0,0.2,1);
    }
    .wrapper:hover .icon-bg {
      fill: #f00;
      fill-opacity: 1;
    }
    </style>
    <div class="wrapper">
      <svg class="icon" height="100%" version="1.1" viewBox="0 0 68 48" width="100%">
        <path class="icon-bg" d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path>
        <path class="icon-play" d="M 45,24 27,14 27,34" fill="#fff"></path>
      </svg>
    </div>
    <slot></slot>
    `
  const videoQueue = [];

  document.addEventListener('DOMContentLoaded', onDomContentLoaded);

  function onDomContentLoaded() {
    document.querySelectorAll(WIDGET_SELECTOR).forEach(node => createPoster(node));  
  }

  function createPoster(node) {
    const { id } = node.dataset;
    const img = document.createElement('img');
    img.src = `https://i.ytimg.com/vi_webp/${id}/maxresdefault.webp`;
    img.style['max-width'] = '100%';
    img.style['display'] = 'block';
    node.addEventListener('click', onPosterClick);
    node.appendChild(img);
    node.attachShadow({
      mode: 'open',
    });
    node.shadowRoot.innerHTML = SHADOW_DOM;
  }

  function onPosterClick(e) {
    const node = e.target.closest(WIDGET_SELECTOR);
    node.removeEventListener('click', onPosterClick);

    /* Если код плеера ещё не запрошен */
    if(document.querySelector(`script[src='${PLAYER_API_SRC}']`) === null) {
      videoQueue.push(node);
      injectYouTubeApi();
      return;
    }

    /* Если код плеера ещё не загрузился */
    if(typeof YT === 'undefined') {
      videoQueue.push(node);
      return;
    }

    playVideo(node)
  }

  function injectYouTubeApi() {
    let tag = document.createElement('script');
    tag.src = PLAYER_API_SRC;
    let firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }
  
  /* Событие при готовности плеера YouTube */
  window.onYouTubePlayerAPIReady = function() {
    playVideos(videoQueue);
  }

  function playVideos(nodes) {
    nodes.forEach(node => playVideo(node));
  }

  function playVideo(node) {
    const playerContainer = document.createElement('div');
    const imgNode = node.querySelector('img');
    const width = imgNode.clientWidth;
    const height = imgNode.clientHeight;
    node.innerHTML = '';
    node.shadowRoot.querySelector('.wrapper').remove();
    node.appendChild(playerContainer);
    new YT.Player(playerContainer, {
      width,
      height,
      videoId: node.dataset.id,
      events: {
        onReady: onPlayerReady,
      },
    });
  }

  function onPlayerReady(e) {
    e.target.playVideo();
  }
})()