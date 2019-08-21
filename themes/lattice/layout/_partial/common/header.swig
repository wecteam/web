<div class="mod-hd">
    <div class="grid">
        <div class="mod-logo">
            <a href="{{ url_for('index.html') }}" title="{{ config.title }}">
                {{ config.title }}
            </a>
        </div>
        <span class="mod-hd-toggle" id="J_hdToggle"><i class="fa fa-bars"></i></span>
        <div class="mod-hd-main">
            <div class="mod-hd-inner"> 
                <nav class="mod-nav">
                    <ul class="mod-nav-list">
                        {{ header_menu('main-nav') }}
                    </ul>
                </nav>

                <a href="/webstatic/blogs/2019/06/04/this-is-the-first/" target="_blank" class="mod-search" id="J_search" style="padding: 0.75em 1.25em;
                    display: inline-block;
                line-height: 1;
                text-decoration: none;
                white-space: nowrap;
                cursor: pointer;
                border: 1px solid #e35108;
                border-radius: 5px;
                background-color: #e35108;
                color: #fff;
                outline: none;
                font-size: 0.75em;">
                    <i class="fa fa-pencil"></i>&nbsp;快速开始
                </a>
                <!--div class="mod-search" id="J_search">
                    <a class="fa fa-search mod-search-ico" id="J_searchTrigger" title="{{ __('menu.search') }}"></a>
                    <form id="J_searchForm" method="get" class="mod-search-form" action="/search/">
                        <input type="text" name="query" class="mod-search-ipt" id="J_searchInput" placeholder="{{ __('menu.search') }}" />
                    </form>
                </div-->
            </div> 
        </div>
    </div>
</div>
