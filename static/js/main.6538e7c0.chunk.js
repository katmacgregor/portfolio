(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{36:function(e,t,n){e.exports=n(62)},46:function(e,t,n){},47:function(e,t,n){},48:function(e,t,n){},49:function(e,t,n){},50:function(e,t,n){},51:function(e,t,n){},52:function(e,t,n){},53:function(e,t,n){},54:function(e,t,n){},55:function(e,t,n){},56:function(e,t,n){},57:function(e,t,n){},58:function(e,t,n){},59:function(e,t,n){},60:function(e,t,n){},61:function(e,t,n){},62:function(e,t,n){"use strict";n.r(t);var a={};n.r(a),n.d(a,"setAppLoaded",function(){return N}),n.d(a,"setDeviceType",function(){return T}),n.d(a,"setItems",function(){return C});var i={};n.r(i),n.d(i,"setBgFixed",function(){return V});var c={};n.r(c),n.d(c,"setItem",function(){return Q});var r={};n.r(r),n.d(r,"setTheme",function(){return le});var o=n(0),s=n.n(o),l=n(22),m=n.n(l),u=n(32),d=n(25),p=n(12),h=n(17),f=n(7),v=n(19),g=n.n(v);function E(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{loaded:!1,device:"desktop",theme:"day",bgFixed:!1},t=arguments.length>1?arguments[1]:void 0;switch(t.type){case"APP_LOADED_SUCCESS":return g()(e,{loaded:{$set:!0}});case"DEVICE_DETECT_SUCCESS":return g()(e,{device:{$set:t.device}});case"SET_THEME_SUCCESS":return g()(e,{theme:{$set:t.theme}});case"SET_BG_FIXED":return g()(e,{bgFixed:{$set:t.fixed}});default:return e}}function b(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{items:[],active:null},t=arguments.length>1?arguments[1]:void 0;switch(t.type){case"ITEMS_FETCH_SUCCESS":return g()(e,{items:{$set:t.items}});case"SET_DETAIL_ITEM":return g()(e,{active:{$set:t.item}});default:return e}}n(46);var k=n(1),y=n(2),j=n(4),O=n(3),w=n(11),S=n(5),N=function(){return{type:"APP_LOADED_SUCCESS"}},T=function(e){return{type:"DEVICE_DETECT_SUCCESS",device:e}},C=function(e){return{type:"ITEMS_FETCH_SUCCESS",items:e}},I=n(14),D=n(24),_=n.n(D),M=function(e,t){fetch(e).then(function(e){var t=e.headers.get("content-type");if(t&&t.includes("application/json"))return e.json();throw new TypeError("not json")}).then(function(e){return t(e)}).catch(function(e){console.log(e)})},F=function(e){var t=e.getBoundingClientRect();return t.bottom>0&&t.right>0&&t.left<(window.innerWidth||window.width())&&t.top<(window.innerHeight||window.height())},x=function(e,t){console.log(t),window.scrollTo({top:0,left:0,behavior:t||"smooth"}),_.a.polyfill()},A=n(8),P=n.n(A),L=(n(47),n(48),n(49),function(e){function t(){var e;return Object(k.a)(this,t),(e=Object(j.a)(this,Object(O.a)(t).call(this))).state={ticking:!1},e.checkPageTop=e.checkPageTop.bind(Object(w.a)(e)),e}return Object(S.a)(t,e),Object(y.a)(t,[{key:"componentDidMount",value:function(){this.checkPageTop()}},{key:"render",value:function(){return s.a.createElement("main",{className:"main-container"},this.props.children)}},{key:"checkPageTop",value:function(){var e=this,t=window.scrollY;this.state.ticking||(window.requestAnimationFrame(function(n){t>0&&x(0,"auto"),e.setState({ticking:!1})}),this.setState({ticking:!0}))}}]),t}(s.a.Component)),U=n(18),V=function(e){return{type:"SET_BG_FIXED",fixed:e}},H=(n(50),n(35)),B=(n(51),[{id:"contact",link:"mailto:hello@katrinamacgregor.com",title:"Contact"},{id:"linkedin",link:"http://us.linkedin.com/in/katrinamacgregor",title:"LinkedIn",new:!0},{id:"github",link:"https://github.com/katmacgregor",title:"Github",new:!0},{id:"codepen",link:"http://codepen.io/katmacgregor/",title:"Code Pen",new:!0},{id:"resume",link:"".concat("","/KMacGregor_resume_web.pdf"),title:"Resume"}]),R=function(e){var t=e.size;return s.a.createElement("div",{className:P()("connect",Object(H.a)({},"icons-".concat(t),t))},B.map(function(e,t){var n=s.a.createElement("span",{className:P()("icon",[e.id])});return e.new?s.a.createElement("a",{href:e.link,title:e.title,className:"skip-link-style",target:"_blank",rel:"noopener noreferrer",key:t},n):s.a.createElement("a",{href:e.link,title:e.title,className:"skip-link-style",key:t},n)}))},G=function(e){function t(){var e;return Object(k.a)(this,t),(e=Object(j.a)(this,Object(O.a)(t).call(this))).state={ticking:!1},e.headerEl=s.a.createRef(),e.checkHeaderVisibility=e.checkHeaderVisibility.bind(Object(w.a)(e)),e}return Object(S.a)(t,e),Object(y.a)(t,[{key:"componentDidMount",value:function(){this.props.checkVisibility&&window.addEventListener("scroll",this.checkHeaderVisibility)}},{key:"componentWillUnmount",value:function(){this.props.checkVisibility&&window.removeEventListener("scroll",this.checkHeaderVisibility)}},{key:"render",value:function(){var e,t=this.props,n=t.nav,a=t.show;return e=n?s.a.createElement(s.a.Fragment,null,s.a.createElement(U.a,{to:"/",className:"skip-link-style"},s.a.createElement("span",{className:"greeting"},"hi,"),s.a.createElement("span",null," i'm katrina."))):s.a.createElement(s.a.Fragment,null,s.a.createElement("h1",{className:"hide"},"Katrina MacGregor"),s.a.createElement("h3",null,"hi,"),s.a.createElement("h2",null," i'm katrina.")),s.a.createElement("div",{className:P()("header-container",{nav:n,show:a}),ref:this.headerEl},s.a.createElement("div",{className:"header"},s.a.createElement("div",{className:"title"},e)),s.a.createElement(R,{size:n?null:"large"}))}},{key:"checkHeaderVisibility",value:function(){var e=this,t=this.headerEl.current;t&&!this.state.ticking&&(window.requestAnimationFrame(function(){var n=F(t);n||e.props.bgFixed?n&&e.props.bgFixed&&e.props.setBgFixed(!1):e.props.setBgFixed(!0),e.setState({ticking:!1})}),this.setState({ticking:!0}))}}]),t}(s.a.Component),W=G=Object(f.c)(function(e){return{bgFixed:e.app.bgFixed}},i)(G),$=(n(52),n(53),function(e){function t(){return Object(k.a)(this,t),Object(j.a)(this,Object(O.a)(t).apply(this,arguments))}return Object(S.a)(t,e),Object(y.a)(t,[{key:"render",value:function(){var e=this.props.item;return s.a.createElement("div",{className:P()("content-item","item-".concat(e.class))},s.a.createElement(U.a,{to:"/".concat(e.class),className:P()("item","skip-link-style"),alt:"{{item.name}}"},s.a.createElement("div",{className:"item"},s.a.createElement("div",{className:"wrapper"},s.a.createElement("div",{className:"thumb"},s.a.createElement("div",{className:"aspect"},s.a.createElement("div",{className:"icon",style:{backgroundImage:"url('".concat("","/images/content/").concat(e.folder,"/port_hp_icons_").concat(e.class,".svg')")}}))),s.a.createElement("div",{className:"content-info",style:{backgroundImage:"url('".concat("","/images/content/").concat(e.folder,"/").concat(e.main_image&&e.main_image.src,"')")}},s.a.createElement("div",{className:"text"},s.a.createElement("h2",{className:"project"},e.name),s.a.createElement("div",{className:"content-desc",dangerouslySetInnerHTML:{__html:e.description}})))))))}}]),t}(s.a.Component)),q=function(e){function t(){return Object(k.a)(this,t),Object(j.a)(this,Object(O.a)(t).apply(this,arguments))}return Object(S.a)(t,e),Object(y.a)(t,[{key:"render",value:function(){var e=this.props,t=e.className,n=e.items;return s.a.createElement("div",{className:P()("content-container-grid",t)},n.map(function(e,t){return s.a.createElement($,{item:e,key:t})}))}}]),t}(s.a.Component),z=q=Object(f.c)(function(e){return{items:e.portfolio.items}})(q),X=(n(54),function(e){function t(){return Object(k.a)(this,t),Object(j.a)(this,Object(O.a)(t).apply(this,arguments))}return Object(S.a)(t,e),Object(y.a)(t,[{key:"render",value:function(){var e=this.props.bgFixed;return s.a.createElement("div",{className:P()("bg-fill",{fixed:e})})}}]),t}(s.a.Component)),J=X=Object(f.c)(function(e){return{bgFixed:e.app.bgFixed}})(X),Y=[{title:"Technologies",items:["HTML5","CSS2/3","Sass","JavaScript","React","Ruby","MongoDB","Canvas","jQuery","Backbone","Gulp","Phaser","npm","Social APIs","Git"]},{title:"Additional Skills",items:["Rapid Prototyping","Interaction Design","IA/UX","Wireframes","Responsive Design","Graphic Design","Agile Methodology","Sketch","Illustrator","Photoshop","InDesign","Painting","Branding","Drawing & Illustration"]}],K=function(e){function t(){var e;return Object(k.a)(this,t),(e=Object(j.a)(this,Object(O.a)(t).call(this))).firstSection=s.a.createRef(),e.handleScrollDown=e.handleScrollDown.bind(Object(w.a)(e)),e}return Object(S.a)(t,e),Object(y.a)(t,[{key:"render",value:function(){return s.a.createElement(L,this.props,s.a.createElement(J,null),s.a.createElement("div",{className:"browse"},s.a.createElement("div",{className:"header content-container fill-screen"},s.a.createElement(W,{checkVisibility:!0}),s.a.createElement("div",{className:"arrow",onClick:this.handleScrollDown})),s.a.createElement("div",{className:"content-container skip-padding",ref:this.firstSection},s.a.createElement(z,null)),s.a.createElement("div",{className:"content-container skills"},s.a.createElement("div",{className:"content-wrapper"},s.a.createElement("div",{className:"section-wrapper"},Y.map(function(e,t){return s.a.createElement("div",{className:"section",key:t},s.a.createElement("h5",null,e.title),s.a.createElement("div",{className:"items"},e.items.map(function(e,t){return s.a.createElement("p",{key:t},e)})))})))),s.a.createElement("div",{className:"about content-container fill-screen"},s.a.createElement("div",{className:"content"},s.a.createElement("p",null,'I made my debut as an artist with "Thanksgiving is Yummy" (Crayola on loose leaf 8.5" by 11"), featured in the kindergarten parent newsletter. This first piece was just one of many, and culminated in getting my BA in Painting and Design at USC\'s Roski School of Fine Arts.'),s.a.createElement("p",null,"My zealous for design transitioned into UI & UX, and rapid protopying quickly grew into full-fledged web development. Today, I'm a UX Engineer at Apple."),s.a.createElement("p",null,"As a developer, I love puzzle-solving, and take a mobile-first, responsive approach in design and code. I get most excited by bringing pages to life with dynamic, performant, and configurable interactions. Daily languages include Javascript, HTML, CSS, and frameworks/libraries including React, Node, MongoDB, and Sass."),s.a.createElement("p",null,"When I'm not tinkering with code, you can find me lounging with my pet rabbit, or wandering the mountains in pursuit of the Milky Way.")))))}},{key:"handleScrollDown",value:function(){this.firstSection.current.scrollIntoView({behavior:"smooth"}),_.a.polyfill()}}]),t}(s.a.Component),Q=function(e){return{type:"SET_DETAIL_ITEM",item:e}},Z=(n(55),n(56),function(e){function t(){return Object(k.a)(this,t),Object(j.a)(this,Object(O.a)(t).apply(this,arguments))}return Object(S.a)(t,e),Object(y.a)(t,[{key:"render",value:function(){return s.a.createElement(U.a,{to:"/".concat(this.props.path),className:P()("index-toggle-root","skip-link-style",{"hide-title":this.props.hideTitle})},s.a.createElement("span",{className:P()("arrow","arrow-".concat(this.props.direction))}),this.props.title)}}]),t}(s.a.Component)),ee=(n(57),function(e){function t(){return Object(k.a)(this,t),Object(j.a)(this,Object(O.a)(t).apply(this,arguments))}return Object(S.a)(t,e),Object(y.a)(t,[{key:"render",value:function(){var e=this.props,t=e.items,n=function(e,t){for(var n=0;n<t.length;n++)if(t[n].folder===e)return n}(e.currItem,t),a=t.length,i=n-1<0?a-1:n-1,c=n+1>=a?0:n+1,r=t[i],o=t[c];return s.a.createElement("div",{className:"paging"},s.a.createElement(Z,{title:r&&r.name,path:r&&r.class,handlerFromParent:this.handleSelect,index:r&&i,hideTitle:this.props.hideTitle,direction:"left"}),s.a.createElement(Z,{title:o&&o.name,path:o&&o.class,handlerFromParent:this.handleSelect,index:o&&c,hideTitle:this.props.hideTitle,direction:"right"}))}}]),t}(s.a.Component)),te=ee=Object(f.c)(function(e){return{items:e.portfolio.items}})(ee),ne=(n(58),function(e){function t(){var e;return Object(k.a)(this,t),(e=Object(j.a)(this,Object(O.a)(t).call(this))).state={playing:!1,ticking:!1},e.videoEl=s.a.createRef(),e.setImageVisibility=e.setImageVisibility.bind(Object(w.a)(e)),e}return Object(S.a)(t,e),Object(y.a)(t,[{key:"componentDidMount",value:function(){this.setImageVisibility(),window.addEventListener("scroll",this.setImageVisibility)}},{key:"componentWillUnmount",value:function(){window.removeEventListener("scroll",this.setImageVisibility)}},{key:"render",value:function(){var e=this.props,t=e.image,n=e.path,a=e.banner,i=s.a.createElement("div",{className:"image-wrapper"},s.a.createElement("div",{className:"aspect"},t.video&&s.a.createElement("video",{src:"".concat("","/images/content/").concat(n,"/").concat(t.video.src,".mp4"),controls:t.video.controls,loop:t.video.loop,alt:t.alt,poster:"".concat("","/images/content/").concat(n,"/").concat(t.video.src,".jpg"),ref:this.videoEl}),!t.video&&s.a.createElement("img",{src:"".concat("","/images/content/").concat(n,"/").concat(t.src),alt:t.alt})));return s.a.createElement("div",{className:P()("asset",[t.classes],{"has-video":t.video,"has-caption":t.caption,banner:a})},t.heading&&t.heading.title&&s.a.createElement("div",{className:"section-header"},s.a.createElement("h2",{className:"section-title"},t.heading.title),t.heading.link&&s.a.createElement("div",null,s.a.createElement("a",{className:"section-link",href:t.heading.link.href,target:"_blank",rel:"noopener noreferrer"},t.heading.link.title))),s.a.createElement("div",{className:"asset-wrapper"},s.a.createElement("div",{className:"image"},t.link&&s.a.createElement("a",{href:t.link,target:"_blank",rel:"noopener noreferrer"},i),!t.link&&i),t.caption&&s.a.createElement("div",{className:"caption",dangerouslySetInnerHTML:{__html:t.caption}})))}},{key:"setImageVisibility",value:function(){var e=this,t=this.videoEl.current;"desktop"===this.props.device&&t&&!this.state.ticking&&(window.requestAnimationFrame(function(){F(t)?e.state.playing||(t.play(),e.setState({playing:!0})):e.state.playing&&(t.pause(),e.setState({playing:!1})),e.setState({ticking:!1})}),this.setState({ticking:!0}))}}]),t}(s.a.Component)),ae=ne=Object(f.c)(function(e){return{device:e.app.device}})(ne),ie=function(e){function t(){return Object(k.a)(this,t),Object(j.a)(this,Object(O.a)(t).apply(this,arguments))}return Object(S.a)(t,e),Object(y.a)(t,[{key:"componentDidMount",value:function(){var e=this.props.match.path,t="".concat("","/portfolio/").concat(e,".json"),n=this;M(t,function(e){n.props.setItem(e)})}},{key:"render",value:function(){var e=this.props.item;return e?s.a.createElement(L,this.props,s.a.createElement("div",{className:"detail"},s.a.createElement("div",{className:"content-container skip-padding"},s.a.createElement("div",{className:"banner-container"},e.banner&&s.a.createElement(ae,{image:e.banner,path:e.path,banner:!0}),s.a.createElement("div",{className:"content-header"},s.a.createElement("h1",{className:"project title"},e.name),e.link&&e.link.title&&s.a.createElement("a",{className:"link",href:e.link.href,target:"_blank",rel:"noopener noreferrer"},s.a.createElement("span",null,e.link.title)))),s.a.createElement("div",{className:"content-info"},s.a.createElement("div",{className:"desc",dangerouslySetInnerHTML:{__html:e.description}}),s.a.createElement("div",{className:"meta-container"},e.date&&s.a.createElement("div",{className:"date-container"},s.a.createElement("h6",{className:"heading"},"Date"),s.a.createElement("span",null,e.date)),s.a.createElement("div",{className:"tools-container"},s.a.createElement("h6",{className:"heading"},"Tools"),e.tools&&s.a.createElement("ul",{className:"tools"},e.tools.map(function(e,t){return s.a.createElement("li",{key:t},e)}))))),s.a.createElement("div",{className:"images"},e.images&&e.images.map(function(t,n){return s.a.createElement(ae,{image:t,path:e.path,key:n})}))),s.a.createElement(te,{currItem:e.path}))):null}}]),t}(s.a.Component),ce=ie=Object(f.c)(function(e){return{item:e.portfolio.active}},c)(ie),re=0,oe=function(e){function t(){var e;return Object(k.a)(this,t),(e=Object(j.a)(this,Object(O.a)(t).call(this))).state={show:!1,ticking:!1},e.handleScroll=e.handleScroll.bind(Object(w.a)(e)),e}return Object(S.a)(t,e),Object(y.a)(t,[{key:"componentDidMount",value:function(){this.props.hideTop||this.setState({show:!0}),window.addEventListener("scroll",this.handleScroll)}},{key:"componentWillUnmount",value:function(){window.removeEventListener("scroll",this.handleScroll)}},{key:"render",value:function(){return s.a.createElement(W,{nav:!0,show:this.state.show})}},{key:"handleScroll",value:function(){var e=this,t=window.scrollY;this.state.ticking||(window.requestAnimationFrame(function(){t<re?e.props.hideTop&&t<=40?e.setState({show:!1}):e.setState({show:!0}):e.state.show&&e.setState({show:!1}),e.setState({ticking:!1}),re=t}),this.setState({ticking:!0}))}}]),t}(s.a.Component),se=(n(59),function(e){function t(){return Object(k.a)(this,t),Object(j.a)(this,Object(O.a)(t).apply(this,arguments))}return Object(S.a)(t,e),Object(y.a)(t,[{key:"render",value:function(){return s.a.createElement("footer",null,s.a.createElement("div",{id:"top"},s.a.createElement("div",{onClick:x},s.a.createElement("div",{className:"arrow"}),s.a.createElement("p",{className:"top-text"}," Back to Top"))),s.a.createElement(R,null),s.a.createElement("div",{className:"copyright"},s.a.createElement("span",null,"\xa9"),s.a.createElement("span",{className:"date","data-year":(new Date).getFullYear()}),s.a.createElement("span",null," Katrina MacGregor")))}}]),t}(s.a.Component)),le=function(e){return{type:"SET_THEME_SUCCESS",theme:e}},me=(n(60),function(e){function t(){var e;return Object(k.a)(this,t),(e=Object(j.a)(this,Object(O.a)(t).call(this))).state={supplementalTheme:"day"},e.processTheme=e.processTheme.bind(Object(w.a)(e)),e}return Object(S.a)(t,e),Object(y.a)(t,[{key:"componentDidMount",value:function(){this.processTheme()}},{key:"render",value:function(){var e=this.props.theme;return s.a.createElement("div",{className:P()("theme theme-".concat(e),"theme-supplement-".concat(this.state.supplementalTheme))},this.props.children)}},{key:"processTheme",value:function(){var e,t=this.props.timeQuery;t?e=t.split("=")[1]:e=this.processTimeOfDay();this.props.setTheme(e),"evening"!==e&&"night"!==e&&"midnight"!==e||this.setState({supplementalTheme:"night"})}},{key:"processTimeOfDay",value:function(){var e=(new Date).getHours();return e>=0&&e<5?"midnight":e>=5&&e<12?"day":e>=12&&e<16?"afternoon":e>=16&&e<20?"evening":e>=20&&e<24?"night":void 0}}]),t}(s.a.Component)),ue=me=Object(f.c)(function(e){return{theme:e.app.theme}},r)(me),de=(n(61),function(e){function t(){return Object(k.a)(this,t),Object(j.a)(this,Object(O.a)(t).apply(this,arguments))}return Object(S.a)(t,e),Object(y.a)(t,[{key:"render",value:function(){return s.a.createElement(L,this.props,s.a.createElement(J,null),s.a.createElement("div",{className:"error-container"},s.a.createElement("div",null,s.a.createElement("h3",null,"Ruh roh"),s.a.createElement("h1",null,"Something ran amuk, please try something else"))))}}]),t}(s.a.Component)),pe=function(e){function t(){var e;return Object(k.a)(this,t),(e=Object(j.a)(this,Object(O.a)(t).call(this))).getPortfolioItems=e.getPortfolioItems.bind(Object(w.a)(e)),e}return Object(S.a)(t,e),Object(y.a)(t,[{key:"componentDidMount",value:function(){var e=this.isMobileDevice()?"mobile":"desktop";this.getPortfolioItems(),this.props.setDeviceType(e)}},{key:"componentDidUpdate",value:function(e){this.props.items!==e.items&&this.props.setAppLoaded()}},{key:"render",value:function(){return s.a.createElement("div",{className:P()("app",{loaded:this.props.loaded})},s.a.createElement(ue,{timeQuery:this.props.location.search||null},s.a.createElement(oe,{hideTop:"/"===this.props.location.pathname}),s.a.createElement(I.c,null,s.a.createElement(I.a,{exact:!0,path:"/",component:K}),this.props.items.map(function(e,t){return s.a.createElement(I.a,{exact:!0,path:"/".concat(e.class),key:t,component:ce})}),s.a.createElement(I.a,{component:de})),s.a.createElement(se,null)))}},{key:"getPortfolioItems",value:function(){var e="".concat("","/portfolio.json"),t=this;M(e,function(e){t.props.setItems(e.items)})}},{key:"isMobileDevice",value:function(){return"undefined"!==typeof window.orientation||-1!==navigator.userAgent.indexOf("IEMobile")}}]),t}(s.a.Component);pe=Object(f.c)(function(e){return{loaded:e.app.loaded,items:e.portfolio.items}},a)(pe);var he=pe=Object(I.f)(pe);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));var fe,ve,ge=Object(p.b)({basename:""}),Ee=Object(h.e)((fe=ge,Object(h.c)({router:Object(d.b)(fe),app:E,portfolio:b})),Object(h.d)(Object(h.a)(Object(u.a)(ge))));ve=he,m.a.render(s.a.createElement(f.a,{store:Ee},s.a.createElement(d.a,{history:ge},s.a.createElement(ve,null))),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})}},[[36,1,2]]]);
//# sourceMappingURL=main.6538e7c0.chunk.js.map