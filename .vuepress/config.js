const CompressionPlugin = require("compression-webpack-plugin");
module.exports = {
  title: "胖丁的博客",
  description: "Talk is cheap. Show me the code.",
  // github pages 需要和仓库名一致
  // 如果绑定域名，则需要设置为 '/'
  base: "/",
  head: [
    [
      "link",
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
    [
      "meta",
      {
        name: "viewport",
        content: "width=device-width,initial-scale=1,user-scalable=no",
      },
    ],
  ],
  locales: {
    "/": {
      lang: "zh-CN",
    },
  },
  dest: 'docs',
  theme: "reco",
  themeConfig: {
    subSidebar: "auto",
    valineConfig: {
      showComment: false,
      appId: "ByrqNE4wW1R91EU2Cj8y2TtY-gzGzoHsz", // your appId
      appKey: "u16rOzRyYATJ6rG4ReeHNhHi", // your appKey
      notify: false,
      verify: false,
      avatar: "monsterid",
      meta: ["nick", "mail"],
      placeholder: "🎈",
      recordIP: true,
    },
    nav: [
      {
        text: "首页",
        link: "/",
        icon: "reco-home",
      },
      {
        text: "项目",
        icon: "reco-three",
        items: [
          {
            text: "WebSocket聊天室",
            link: "http://www.pd-blog.com:3000",
            icon: "reco-blog",
          },
          {
            text: "后台管理系统",
            link: "http://gitee.com/pdzz/pdadmin",
            icon: "reco-blog",
          },
        ],
      },
      {
        text: "评论",
        link: "/message/",
        icon: "reco-suggestion",
      },
      {
        text: "时间轴",
        link: "/timeline/",
        icon: "reco-date",
      },
      {
        text: "Gitee",
        link: "https://gitee.com/pdzz/myblog",
        icon: "reco-mayun",
      },
    ],
    sidebar: {
      "/docs/theme-reco/": ["", "theme", "plugin", "api"],
    },
    type: "blog",
    blogConfig: {
      category: {
        location: 2,
        text: "分类",
      },
      tag: {
        location: 3,
        text: "标签",
      },
    },
    friendLink: [
      {
        title: "廖雪峰",
        desc: "廖雪峰blog",
        link: "https://www.liaoxuefeng.com/",
      },
      {
        title: "阮一峰",
        desc: "阮一峰的网络日志",
        link: "http://www.ruanyifeng.com/blog/",
      },
    ],
    logo: "/image/logo.jpg",
    search: true,
    searchMaxSuggestions: 10,
    lastUpdated: "Last Updated",
    author: "pdzz",
    authorAvatar: "/image/avatar.jpg",
    record: "苏ICP备2020053991号-1",
    recordLink: "https://beian.miit.gov.cn/#/Integrated/index",
    startYear: "2019",
  },
  markdown: {
    lineNumbers: true,
  },
  configureWebpack: {
    // webpack plugins
    plugins: [
      //提供带 Content-Encoding 编码的压缩版的资源
      new CompressionPlugin({
        algorithm: "gzip",
        test: /\.js$|\.html$|\.css/, // 匹配文件名
        // test: /\.(js|css)$/,
        threshold: 10240, // 对超过10k的数据压缩
        deleteOriginalAssets: false, // 不删除源文件
        minRatio: 0.8, // 压缩比
      }),
    ],
  },
  plugins: [
    // ['@vuepress-reco/vuepress-plugin-bulletin-popover', {
    //   title: '消息提示',
    //   body: [
    //     {
    //       type: 'title',
    //       content: '欢迎访问 🎉🎉🎉',
    //       style: 'text-aligin: center;',
    //     },
    //     {
    //       type: 'text',
    //       content: '喜欢的主题特效可以clone个人gitee仓库',
    //       style: 'text-align: center;'
    //     }
    //   ],
    //   footer: [
    //     {
    //       type: 'button',
    //       text: '关注',
    //       link: '/attention/'
    //     },
    //   ]
    // }],
    [
      "@vuepress-reco/vuepress-plugin-kan-ban-niang",
      {
        theme: [
          "miku",
          "whiteCat",
          "haru1",
          "haru2",
          "haruto",
          "koharu",
          "izumi",
          "shizuku",
          "wanko",
          "blackCat",
          "z16",
        ],
        clean: false,
        messages: {
          welcome: "欢迎来到我的博客",
          home: "心里的花，我想要带你回家。",
          theme: "好吧，希望你能喜欢我的其他小伙伴。",
          close: "你不喜欢我了吗？痴痴地望着你。",
        },
        messageStyle: { right: "68px", bottom: "290px" },
        width: 250,
        height: 320,
      },
    ],
    [
      "vuepress-plugin-cursor-effects",
      {
        size: 2, // size of the particle, default: 2
        shape: "circle", // shape of the particle, default: 'star'
        zIndex: 999999999, // z-index property of the canvas, default: 999999999
      },
    ],
    // [
    //   "ribbon-animation",
    //   {
    //     size: 90, // 默认数据
    //     opacity: 0.3, //  透明度
    //     zIndex: -1, //  层级
    //     opt: {
    //       // 色带HSL饱和度
    //       colorSaturation: "80%",
    //       // 色带HSL亮度量
    //       colorBrightness: "60%",
    //       // 带状颜色不透明度
    //       colorAlpha: 0.65,
    //       // 在HSL颜色空间中循环显示颜色的速度有多快
    //       colorCycleSpeed: 6,
    //       // 从哪一侧开始Y轴 (top|min, middle|center, bottom|max, random)
    //       verticalPosition: "center",
    //       // 到达屏幕另一侧的速度有多快
    //       horizontalSpeed: 200,
    //       // 在任何给定时间，屏幕上会保留多少条带
    //       ribbonCount: 2,
    //       // 添加笔划以及色带填充颜色
    //       strokeSize: 0,
    //       // 通过页面滚动上的因子垂直移动色带
    //       parallaxAmount: -0.5,
    //       // 随着时间的推移，为每个功能区添加动画效果
    //       animateSections: true,
    //     },
    //     ribbonShow: false, //  点击彩带  true显示  false为不显示
    //     ribbonAnimationShow: true, // 滑动彩带
    //   },
    // ],
  ],
};
