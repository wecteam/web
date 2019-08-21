var _commemttpl = '<div class="gt-comment " style="transform-origin: center top;">\
        <a href="{link}" target="_blank" class="gt-avatar gt-comment-avatar">\
            <img src="{pic}" alt="头像">\
        </a>\
        <div class="gt-comment-content">\
            <div class="gt-comment-header">\
                <a class="gt-comment-username" href="{link}" target="_blank">{nick}</a>\
                <span class="gt-comment-text">发表于</span>\
                <span class="gt-comment-date">{time}</span>\
            </div>\
            <div class="gt-comment-body markdown-body">{msg}</div>\
        </div>\
    </div>';
var tpl = '<div class="gt-container">\
<div class="gt-meta"><span class="gt-counts">\
<a id="comment_count" class="gt-link gt-link-counts" target="_blank">0</a>\
 条评论</span><div class="gt-user"><div class="gt-user-inner"><span class="gt-user-name" id="comment_usernick">未登录用户</span></div></div></div><div class="gt-header"><a class="gt-avatar-github" id="comment_userlink"><img id="comment_userpic" alt="头像"></a><div class="gt-header-comment"><textarea id="comment_textarea" class="gt-header-textarea " placeholder="说点什么" style="overflow: hidden; overflow-wrap: break-word; resize: none; height: 123px;"></textarea><div class="gt-header-preview markdown-body hide"></div><div class="gt-header-controls"><a class="gt-header-controls-tip" href="https://guides.github.com/features/mastering-markdown/" target="_blank"></a><button class="gt-btn gt-btn-login" id="comment_btn"><span class="gt-btn-text" id="comment_btntext">使用 JDGIT 登录</span></button></div></div></div><div class="gt-comments">\
<div style="position: relative;" id="comment_list">\
</div>\
    </div></div>';
// 锁
var clickLock = false;

if (typeof gitalkOpts !== 'undefined') {
    // $.ajax({
    //   //   crossDomain:true,
    //   //   xhrFields: {
    //   //         withCredentials: true
    //   // },
    //   type: 'get',
    //   // url: "//git.jd.com/api/v4/projects/61937/issues/1/notes?private_token=VL9Sh_X3zqs1H_ngUZma",
    //   url: "//git.jd.com/api/v3/user",
    //   success: function () {
    //     debugger
    //     $("#comments").html(tpl);
    //   },
    //   dataType: "json"
    // });
    // debugger
    // 首先，看看缓存里面是否有token
    // window._accessToken = window.localStorage.getItem("Git_TK");
    // if (!_accessToken) {
    //     // 如果没有的话，就去生成一个
    var code = location.hash.match(/code=([^&]+)/);
    if (code) {
        location.hash = "";
        code = code[1];
        // 要去鉴权了啊
        $.ajax({
            type: 'get',
            url: "http://wqadmin.jd.com/webstatic/user,gettoken?code=" + code,
            success: function (data) {
                var _accessToken = !data.error ? data.access_token : "";
                // 打入缓存
                window.localStorage.setItem("Git_TK", _accessToken);
                doRender();
            },
            dataType: "json"
        });
    } else {
        doRender();
    }

    // 开始渲染
    function doRender() {
        // 用管理员的privatekey（就是我本人），查询
        $.ajax({
            type: 'get',
            url: "//git.jd.com/api/v4/projects/61937/issues/" + gitalkOpts.id + "/notes?private_token=VL9Sh_X3zqs1H_ngUZma",
            success: function (commentlist) {
                window.commentlist = commentlist.reverse();
                // 再去查询个人信息
                $.ajax({
                    type: 'get',
                    url: "//git.jd.com/api/v4/user",
                    success: function (userinfo) {
                        // 再去查询个人信息
                        // debugger
                        // $("#comments").html(tpl);
                        renderComments(userinfo);
                    },
                    error: function () {
                        renderComments();
                    },
                    dataType: "json",
                    headers:{'Authorization':'Bearer ' + window.localStorage.getItem("Git_TK")},
                });
                // $("#comments").html(tpl);
            },
            dataType: "json"
        });
    }

    // 渲染评论信息啊
    function renderComments (userinfo) {
        $("#comments").html(tpl);
        // 判断是否登录
        if (userinfo) {
            $("#comment_usernick").html(userinfo.username);
            $("#comment_userpic").attr("src", userinfo.avatar_url);
            $("#comment_btntext").html("评论");
            $("#comment_userlink").off().attr("href", userinfo.web_url);
            $("#comment_btntext").off().on("click", function () {
                // 去评论
                tocomment();
            });
        } else {
            $("#comment_usernick").html("未登录用户");
            $("#comment_userpic").attr("src", "http://git.jd.com/assets/no_avatar-849f9c04a3a0d0cea2424ae97b27447dc64a7dbfae83c036c45b403392f0e8ba.png");
            $("#comment_btntext").html("使用 JDGIT 登录");
            $("#comment_userlink").off();
            $("#comment_btn, #comment_userlink").off().on("click", function () {
                // 去登录
                location.href = "//git.jd.com/oauth/authorize?client_id=cef5791d791e9bca793b81f54d7dc8db34d12edb7da5966f8c6ce7e479d61f6b&redirect_uri=http://wqadmin.jd.com/webstatic/blogs/&response_type=code&state=" + encodeURIComponent(location.href);
            });
        }

        // 渲染列表
        renderList();
    }

    // 渲染评论列表
    function renderList() {
        var _str = "";
        window.commentlist.sort(function(a,b){return new Date(a.updated_at) < new Date(b.updated_at)}).forEach(function (ceil) {
            _str += _commemttpl.replace(/\{link\}/g, ceil.author.web_url).replace("{pic}", ceil.author.avatar_url).replace("{nick}", ceil.author.username).replace("{time}", formatTime(new Date(ceil.updated_at))).replace("{msg}", ceil.body);
        });
        $("#comment_list").html(_str);
        $("#comment_count").html(window.commentlist.length).attr("href", "http://git.jd.com/sjds-MP/blogs/issues/" + gitalkOpts.id);
    }

    // 格式化时间
    function formatTime(time) {
        var iNow = (new Date()).getTime(),
        iHour = 3600,
        iDate = 86400,
        iYear = 31536000,
        iMinute = 60;

        var iTime = time,
            iDiff,
            sTimeStr;
        iDiff = (iNow - iTime.getTime()) / 1000;

        if (iDiff > iYear) {
            sTimeStr = Math.floor(iDiff / iYear) + '年前';
        } else if (iDiff > iDate) {
            sTimeStr = Math.floor(iDiff / iDate) + '天前';
        } else if (iDiff > iHour) {
            sTimeStr = Math.floor(iDiff / iHour) + '小时前';
        } else if (iDiff > iMinute) {
            sTimeStr = Math.floor(iDiff / iMinute) + '分钟前';
        } else {
            sTimeStr = '刚刚';
        }

        return sTimeStr;
    }

    // 评论啊
    function tocomment () {
        // 加锁
        if (clickLock) return false;
        clickLock = true;
        var val = $("#comment_textarea").val();
        if (!val) {
            // 不能提交空的
            alert("请输入评论内容");
            clickLock = false;
            return false;
        }
        $.ajax({
            type: 'post',
            url: "//git.jd.com/api/v4/projects/61937/issues/" + gitalkOpts.id + "/notes",
            success: function (data) {
                $("#comment_textarea").val("");
                // 评论成功之后，插入数据
                window.commentlist.unshift(data);
                renderList();
                clickLock = false;
            },
            data: {
                id: 61937,
                issue_id: gitalkOpts.id,
                body: val,
                created_at: new Date().toISOString()
            },
            error: function () {
                alert("评论失败！");
                clickLock = false;
            },
            dataType: "json",
            headers:{'Authorization':'Bearer ' + window.localStorage.getItem("Git_TK")},
        });
    }
    
    // $.ajax({
    //     type: 'get',
    //     url: "http://wqadmin.jd.com/webstatic/user,gettoken?code=2245418975ae168852f6a2e51973d4c90b8938be3bd35ccfa16eb23e5d6cbdf0",
    //     success: function () {
    //         debugger
    //         $("#comments").html(tpl);
    //     },
    //     // beforeSend: function(xhr) {
    //     //   xhr.setRequestHeader("Authorization:'1333333333'");
    //     // },
    //     headers:{'Authorization':'aaaaa'},
    //     dataType: "json"
    // });


    // $.ajax({
    //   type: 'get',
    //   url: "http://wqadmin.jd.com/webstatic/user,gettoken?code=2245418975ae168852f6a2e51973d4c90b8938be3bd35ccfa16eb23e5d6cbdf0",
    //   success: function () {
    //     debugger
    //     $("#comments").html(tpl);
    //   },
    //   // beforeSend: function(xhr) {
    //   //   xhr.setRequestHeader("Authorization:'1333333333'");
    //   // },
    //   headers:{'Authorization':'aaaaa'},
    //   dataType: "json"
    // });

    // axios.post("http://git.jd.com/oauth/token", {
    //     code: "684951b7cb1acbae41444af24fa7848421c7a182ae2bea4a3b819cdea42a530c",
    //     client_id: "cef5791d791e9bca793b81f54d7dc8db34d12edb7da5966f8c6ce7e479d61f6b",
    //     client_secret: "c12cc1a9fde224e020b1e340ee47b480ce575122ea83724ea5e14f9f7430deb9",
    //     grant_type: "authorization_code",
    //     redirect_uri: "http://wqadmin.jd.com/webstatic/blogs/"
    //   }).then(function (res) {
    //     debugger
    //   }).catch(function (err) {
    //     debugger
    //   });

    // var gitalk = new Gitalk(gitalkOpts);
    // gitalk.render('comments');
}


