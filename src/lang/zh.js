export default {
  route: {
    dashboard: '首页',
    icons: '图标',
    components: '组件',
    Table: 'Table',
    complexTable: '综合 Table',
    tab: 'Tab',
    form: '表单',
    createArticle: '创建文章',
    editArticle: '编辑文章',
    articleList: '文章列表',
    errorPages: '错误页面',
    page401: '401',
    page404: '404',
    errorLog: '错误日志',
    theme: '换肤',
    profile: '个人中心'
  },
  navbar: {
    dashboard: '首页',
    github: '项目地址',
    logOut: '退出登录',
    profile: '个人中心',
    theme: '换肤',
    size: '布局大小'
  },
  login: {
    title: '测试门户系统登录',
    logIn: '登录',
    username: '账号',
    password: '密码',
    any: '随便填'
  },
  permission: {
    addRole: '新增角色',
    editPermission: '编辑权限',
    roles: '你的权限',
    switchRoles: '切换权限',
    tips: '在某些情况下，不适合使用 v-permission。例如：Element-UI 的 el-tab 或 el-table-column 以及其它动态渲染 dom 的场景。你只能通过手动设置 v-if 来实现。',
    delete: '删除',
    confirm: '确定',
    cancel: '取消'
  },
  table: {
    name: '节点名称',
    title: '测试项目',
    intro: '介绍',
    server: '测试节点',
    type: '菜单',
    search: '搜索',
    add: '添加',
    port: '端口',
    os: '操作系统',
    uploader: '编辑者',
    id: 'ID',
    ip: 'IP地址',
    id_sort: 'ID排序',
    date: '最近一次运行时间',
    author: '作者',
    status: '状态',
    actions: '操作',
    script: '脚本',
    save: '提交',
    upload_tips: '目前仅允许上传1个文件，同级菜单下的脚本文件不允许同名',
    command: '运行命令',
    params: '参数',
    edit: '编辑',
    run: '运行',
    runSelected: '执行选中',
    enable: '启用',
    disable: '禁用',
    connect: '连接',
    disconnect: '断开',
    editUser: '修改节点用户信息',
    oldUsername: '用户名',
    oldPassword: '旧密码',
    newUsername: '新用户名',
    newPassword: '新密码',
    validate: '验证',
    secondPassword: '确认密码',
    delete: '删除',
    cancel: '取 消',
    confirm: '确 定'
  },
  example: {
    warning: '创建和编辑页面是不能被 keep-alive 缓存的，因为keep-alive 的 include 目前不支持根据路由来缓存，所以目前都是基于 component name 来进行缓存的。如果你想类似的实现缓存效果，可以使用 localStorage 等浏览器缓存方案。或者不要使用 keep-alive 的 include，直接缓存所有页面。详情见'
  },
  errorLog: {
    tips: '请点击右上角bug小图标',
    description: '现在的管理后台基本都是spa的形式了，它增强了用户体验，但同时也会增加页面出问题的可能性，可能一个小小的疏忽就导致整个页面的死锁。好在 Vue 官网提供了一个方法来捕获处理异常，你可以在其中进行错误处理或者异常上报。',
    documentation: '文档介绍'
  },
  excel: {
    export: '导出',
    selectedExport: '导出已选择项',
    placeholder: '请输入文件名(默认excel-list)'
  },
  zip: {
    export: '导出',
    placeholder: '请输入文件名(默认file)'
  },
  pdf: {
    tips: '这里使用   window.print() 来实现下载pdf的功能'
  },
  theme: {
    change: '换肤',
    documentation: '换肤文档',
    tips: 'Tips: 它区别于 navbar 上的 theme-pick, 是两种不同的换肤方法，各自有不同的应用场景，具体请参考文档。'
  },
  tagsView: {
    refresh: '刷新',
    close: '关闭',
    closeOthers: '关闭其它',
    closeAll: '关闭所有'
  },
  settings: {
    title: '系统布局配置',
    theme: '主题色',
    tagsView: '开启 Tags-View',
    fixedHeader: '固定 Header',
    sidebarLogo: '侧边栏 Logo'
  }
}
