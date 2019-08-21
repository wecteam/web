<footer class="mod-ft" id="footer">
    <div class="grid">
            <div class="mod-ft-sec mod-ft-copyright">
                <p>社交前端知识平台</p>
                <p>Copyright &copy; {{ moment(Date.now()).year() }}. All Rights Reserved.</p>
            </div>
        </div>
</footer>

<!-- Scripts -->
<!-- build:js /js/bundle/core.js -->
{{ js('js/libs/debounce') }}
{{ js('js/libs/jquery') }}
{{ js('js/libs/jquery.scrollPager') }}
{{ js('js/libs/hogan-3.0.2') }}
{{ js('js/libs/base64') }}
{{ js('js/mods/util') }}
{{ js('js/mods/common') }}
{{ js('js/mods/console') }}
{{ js('js/mods/scrollPager') }}
{{ js('js/mods/jweixin-1.0.0') }}
<!-- endbuild -->

{% if theme.gitalk %}
<script src="https://unpkg.com/gitalk/dist/gitalk.min.js"></script>
{% endif %}
