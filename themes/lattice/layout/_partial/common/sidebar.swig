<aside class="mod-side" id="sidebar">
    <!-- <div class="mod-side-sec aotuwx">
        <img  class="aotuwx-qrcode" src="{{ url_for('img/qrcode.jpg') }}" alt="{{ __('site.follow_us') }}"/> 
        <div class="aotuwx-slogan">每周五推送精选技术文章</div>
    </div> -->

    <div class="mod-side-sec works"> 
        <div class="mod-side-sec-hd">
            <h2>{{ __('menu.tags') }}</h2>
        </div>
        <div class="mod-side-sec-bd">
            <ul class="mod-side-list">
                {% for item in site.tags %}
                <li>
                    <a href="{{ url_for(item.path) }}" target="_blank" title="{{ item.name }}">
                        {{ item.name }}
                    </a>
                </li>
                {% endfor %}
            </ul>
        </div> 
    </div>

    <div class="mod-side-sec works"> 
        <div class="mod-side-sec-hd">
            <h2>记录</h2>
        </div>
        <div class="mod-side-sec-bd">
            <ul class="mod-side-list">
                {{ list_archives({show_count: false}) }}
            </ul>
        </div> 
    </div>
  
</aside>