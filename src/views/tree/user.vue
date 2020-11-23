<template>
  <div class="app-container">
    <el-container direction="vertical">
      <el-main>
        <el-col :offset="1" :span="8">
          <el-tree
            ref="userTree"
            node-key="id"
            :data="data"
            :props="defaultProps"
            :highlight-current="true"
            :expand-on-click-node="false"
            :draggable="true"
            :allow-drag="checkDrag"
            :allow-drop="checkDrop"
            class="el-tree el-tree--highlight-current"
            @node-drop="nodeDrop"
            @node-expand="closeMenu"
            @node-click="clickNode"
            @node-collapse="closeMenu"
            @node-contextmenu="openMenu">
            <span slot-scope="{ node, data }" class="custom-tree-node">
              <el-icon v-if="'title' in data" class="el-icon-folder" style="margin-right: 10px;"/>
              <span v-if="'title' in data">{{data.title}}</span>
              <el-icon v-if="'username' in data" class="el-icon-user" style="margin-right: 10px;"/>
              <span v-if="'username' in data">{{data.username}}</span>
            </span>
          </el-tree>
        </el-col>

        <el-col :span="12" :offset="1">
          <el-form ref="userForm"
                   :model="temp"
                   v-show="infoVisible"
                   v-loading="loading"
                   label-position="right"
                   label-width="120px"
                   size="small">
            <el-form-item v-if="'title' in temp" :label="$t('group.id')" prop="id">
              <span>{{temp.id}}</span>
            </el-form-item>
            <el-form-item v-if="'title' in temp" :label="$t('group.title')" prop="title">
              <span>{{temp.title}}</span>
            </el-form-item>
            <el-form-item v-if="'title' in temp" :label="$t('group.description')" prop="description">
              <span>{{temp.description}}</span>
            </el-form-item>
            <el-row>
            <el-col :span="12">
              <el-form-item v-if="'title' in temp" :label="$t('group.viewPermission')" prop="viewPermission">
                  <el-tree
                    ref="viewTree"
                    :props="defaultProps"
                    :data="temp.menus"
                    :default-checked-keys="defaultViewChecked"
                    :check-strictly="true"
                    node-key="id"
                    show-checkbox
                    @check-change="handleViewCheckChange"/>
              </el-form-item>
              <el-form-item v-if="'title' in temp">
                <el-button type="primary" @click="submit">{{$t('menu.save')}}</el-button>
                <el-button @click="cancel">{{$t('menu.cancel')}}</el-button>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item v-if="'title' in temp" :label="$t('group.editPermission')" label-width="80px"  prop="editPermission">
                  <el-tree
                    ref="editTree"
                    :props="defaultProps"
                    :data="temp.menus"
                    :default-checked-keys="defaultEditChecked"
                    :check-strictly="true"
                    node-key="id"
                    show-checkbox
                    @check-change="handleEditCheckChange"/>
              </el-form-item>
            </el-col>
            </el-row>

            <el-form-item v-if="'username' in temp" :label="$t('user.guid')" prop="guid">
              <span>{{temp.guid}}</span>
            </el-form-item>
            <el-form-item v-if="'username' in temp" :label="$t('user.username')" prop="username">
              <span>{{temp.username}}</span>
            </el-form-item>
            <el-form-item v-if="'username' in temp" :label="$t('user.email')" prop="email">
              <span>{{temp.email}}</span>
            </el-form-item>
            <el-form-item v-if="'username' in temp" :label="$t('user.createdTime')" prop="createdTime">
              <span>{{temp.createdTime}}</span>
            </el-form-item>
            <el-form-item v-if="'username' in temp" :label="$t('user.lastLoginTime')" prop="lastLoginTime">
              <span>{{temp.lastLoginTime}}</span>
            </el-form-item>
            <el-form-item v-if="'username' in temp" :label="$t('user.lastLoginIP')" prop="lastLoginIP">
              <span>{{temp.lastLoginIP}}</span>
            </el-form-item>
            <el-form-item v-if="'username' in temp" :label="$t('user.loginCount')" prop="loginCount">
              <span>{{temp.loginCount}}</span>
            </el-form-item>
          </el-form>
        </el-col>
      </el-main>
    </el-container>
    <ul v-show="menuVisible" :style="{left:menu.left+'px',top:menu.top+'px'}" class="contextmenu">
      <li @click="addUser">添加用户</li>
      <li v-if="selectedNode && 'children' in selectedNode.data" @click="addGroup">添加用户组</li>
      <li v-if="selectedNode && !('children' in selectedNode.data)" @click="deleteUser">删除用户</li>
      <li v-if="selectedNode && 'children' in selectedNode.data" @click="deleteGroup">删除用户组</li>
    </ul>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="500px" center :close-on-click-modal="false">
      <el-form ref="addForm"
               :model="dialogStatus==='user'?addUserData:addGroupData"
               :rules="dialogStatus==='user'?userRules:groupRules"
               label-position="right"
               label-width="120px"
               size="small">
        <el-form-item v-if="dialogStatus==='user'" :label="$t('user.username')" prop="username">
          <el-input v-model="addUserData.username" placeholder="用户名唯一"/>
        </el-form-item>
        <el-form-item v-if="dialogStatus==='user'" :label="$t('user.email')" prop="email">
          <el-input v-model="addUserData.email" placeholder="电子邮箱地址唯一"/>
        </el-form-item>
        <el-form-item v-if="dialogStatus==='user'" :label="$t('user.password')" prop="password">
          <el-input v-model="addUserData.password" type="password" placeholder="密码不少于6位，由数字、字母或特殊符号组成"/>
        </el-form-item>
        <el-form-item v-if="dialogStatus==='user'" :label="$t('user.secondPassword')" prop="secondPassword">
          <el-input v-model="addUserData.secondPassword" type="password" placeholder="再次输入密码"/>
        </el-form-item>
        <el-form-item v-if="dialogStatus==='group'" :label="$t('group.title')" prop="title">
          <el-input v-model="addGroupData.title" placeholder="用户组名唯一"/>
        </el-form-item>
        <el-form-item v-if="dialogStatus==='group'" :label="$t('group.description')" prop="description">
          <el-input v-model="addGroupData.description" placeholder="用户组描述"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="dialogStatus==='user'?submitUser():submitGroup()">
          {{$t('user.save')}}
        </el-button>
        <el-button @click="dialogFormVisible=false" size="small">{{$t('user.cancel')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {changeAuth, fetchAuth, fetchGroup} from "@/api/group";
import {changeGroup, createUser, deleteUser} from "@/api/user";
import {createGroup, deleteGroup} from "@/api/group"

export default {
  name: "user",
  data() {
    let validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.addUserData.password) {
        callback(new Error('两次输入的密码不一致!'));
      } else {
        callback();
      }
    };
    return {
      data: [],
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      menuVisible: false,
      selectedNode: undefined,
      menu: {
        top: 0,
        left: 0,
      },
      loading: false,
      infoVisible: false,
      temp: {
        id: undefined,
        title: undefined,
        description: undefined
      },
      defaultViewChecked: [],
      defaultEditChecked: [],
      textMap: {
        user: '添加用户',
        group: '添加用户组'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      addUserData: {
        username: undefined,
        email: undefined,
        password: undefined,
        secondPassword: undefined,
      },
      addGroupData: {
        title: undefined,
        description: undefined,
      },
      userRules: {
        username: [{required: true, message: '用户名为必填项', trigger: 'blur'}],
        email: [{required: true, message: '邮箱地址为必填项', trigger: 'blur'},
          {type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change']}],
        password: [{required: true, message: '密码为必填项', trigger: 'blur'},
          { min: 6, max: 20, message: '密码不少于6位'}],
        secondPassword: [{required: true, validator: validatePass, trigger: 'blur'}]
      },
      groupRules: {
        title: [{required: true, message: '用户组名为必填项', trigger: 'blur'}],
        description: [{required: true, message: '用户组介绍为必填项', trigger: 'blur'}]
      },
      lastParentNode: undefined
    }
  },
  created() {
    this.fetchData()
  },
  watch: {
    menuVisible(value) {
      if (value) {
        document.body.addEventListener('click', this.closeMenu)
      } else {
        document.body.removeEventListener('click', this.closeMenu)
      }
    }
  },
  methods: {
    fetchData() {
      fetchGroup().then((response) => {
        this.data = response.data
      })
    },
    openMenu(event, obj, node) {
      const menuMinWidth = 105
      const offsetLeft = this.$el.getBoundingClientRect().left // container margin left
      const offsetWidth = this.$el.offsetWidth // container width
      const maxLeft = offsetWidth - menuMinWidth // left boundary
      const left = event.clientX - offsetLeft // 15: margin right
      if (left > maxLeft) {
        this.menu.left = maxLeft
      } else {
        this.menu.left = left
      }
      this.menu.top = event.pageY - 85
      this.menuVisible = true
      this.selectedNode = node
    },
    closeMenu() {
      if (this.menuVisible) {
        this.menuVisible = false
      }
    },
    clickNode(data) {
      this.closeMenu()
      this.infoVisible = true
      this.temp = {}
      if('title' in data) {
        this.loading = true
        this.temp.id = data.id
        this.temp.title = data.title
        this.temp.description = data.description
        fetchAuth(data.id).then((response) => {
          this.temp.menus = response.data
          this.defaultViewChecked = this.defaultChecked('view')
          this.defaultEditChecked = this.defaultChecked('edit')
          this.loading = false
        })
      }
      if('username' in data) {
        this.temp.guid = data.guid
        this.temp.username = data.username
        this.temp.email = data.email
        this.temp.createdTime = data.createdTime
        this.temp.lastLoginTime = data.lastLoginTime
        this.temp.lastLoginIP = data.lastLoginIP
        this.temp.loginCount = data.loginCount
        if(this.temp.lastLoginTime === null) {
          this.temp.lastLoginTime = '尚未登录'
        }
        if(this.temp.lastLoginIP === null) {
          this.temp.lastLoginIP = '尚未登录'
        }
      }
    },
    defaultChecked(type) {  // type in ['view', 'edit]
      let temp = deepClone(this.temp.menus)
      let res = []
      for(let i=0; i<temp.length; i++) {
        if (temp[i][type] === true) {
          res.push(temp[i]['id'])
        }
        if ('children' in temp[i]) {
          for(let j=0; j<temp[i]['children'].length; j++) {
            temp.push(temp[i]['children'][j])
          }
        }
      }
      return res
    },
    handleViewCheckChange(node, checked) {
      if (!checked) {
        this.$refs.editTree.setChecked(node['id'], checked)
      }
    },
    handleEditCheckChange(node, checked) {
      if (checked) {
        this.$refs.viewTree.setChecked(node['id'], checked)
      }
    },
    submit() {
      let viewData = this.$refs.viewTree.getCheckedKeys().concat(this.$refs.viewTree.getHalfCheckedKeys())
      let editData = this.$refs.editTree.getCheckedKeys().concat(this.$refs.editTree.getHalfCheckedKeys())
      let data = {'view':{}, 'edit': {}, 'groupId': this.temp.id}
      getDiff(viewData, this.defaultViewChecked).forEach(function (value) {
        data['view'][value] = true
      })
      getDiff(this.defaultViewChecked, viewData).forEach(function (value) {
        data['view'][value] = false
      })
      getDiff(editData, this.defaultEditChecked).forEach(function (value) {
        data['edit'][value] = true
      })
      getDiff(this.defaultEditChecked, editData).forEach(function (value) {
        data['edit'][value] = false
      })
      this.loading = true
      changeAuth(data).then((response) => {
        this.$message({type:response['type'], message: response['message']})
        if (response['type'] === 'success') {
          this.defaultViewChecked = viewData
          this.defaultEditChecked = editData
        }
        this.loading = false
      })
    },
    cancel() {
      this.defaultViewChecked = []
      this.defaultEditChecked = []
      this.$refs.userTree.setCurrentKey(null)
      this.infoVisible = false
    },
    addUser() {
      this.dialogStatus = 'user'
      this.dialogFormVisible = true
      if (this.$refs['addForm'] !== undefined) {
        this.$refs.addForm.clearValidate()
      }
    },
    deleteUser() {
      this.$confirm('此操作将永久删除该用户账户，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let guid = this.selectedNode.data['guid']
        deleteUser(guid).then((response) => {
          this.$message({type: response['type'], message: response['message']})
          if(response['type'] === 'success') {
            this.$refs.userTree.remove(this.selectedNode)
          }
        })
      })
    },
    addGroup() {
      this.dialogStatus = 'group'
      this.dialogFormVisible = true
      if (this.$refs['addForm'] !== undefined) {
        this.$refs.addForm.clearValidate()
      }
    },
    deleteGroup() {
      this.$confirm('此操作将永久删除该用户组下的所有用户及这些用户上传的测试项，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let groupId = this.selectedNode.data.id
        deleteGroup(groupId).then((response) => {
          this.$message({type: response['type'], message: response['message']})
          if (response['type'] === 'success') {
            this.$refs.userTree.remove(this.selectedNode)
          }
        })
      })
    },
    submitUser() {
      this.$refs['addForm'].validate((valid) => {
        if (valid) {
          let groupId = 'id' in this.selectedNode.data?this.selectedNode.data.id:this.selectedNode.parent.data.id;
          let params = {'username': this.addUserData.username, 'email': this.addUserData.email,
            'password': this.addUserData.password, 'groupId': groupId}
          createUser(params).then((response) => {
            this.$message({type: response['type'], message: response['message']})
            if(response['type'] === 'success') {
              for(let i=0; i<this.data.length; i++) {
                if(this.data[i]['id'] === groupId) {
                  this.data[i]['children'].push(response['data'])
                }
              }
              this.addUserData = {
                username: undefined,
                email: undefined,
                password: undefined,
                secondPassword: undefined,
              }
              this.dialogFormVisible = false
            }
          })
        }
      })
    },
    submitGroup() {
      this.$refs['addForm'].validate((valid) => {
        if (valid) {
          let params = {'title': this.addGroupData.title, 'description': this.addGroupData.description}
          createGroup(params).then((response) => {
            this.$message({type: response['type'], message: response['message']})
            if (response['type'] === 'success') {
              let data = response['data']
              data['children'] = []
              this.data.push(response['data'])
              this.addGroupData = {
                title: undefined,
                description: undefined,
              }
              this.dialogFormVisible = false
            }
          })
        }
      })
    },
    checkDrag(node) {
      return 'guid' in node.data;
    },
    checkDrop(draggingNode, dropNode, type) {
      this.lastParentNode = draggingNode.parent
      return 'id' in dropNode.data && type === 'inner';
    },
    nodeDrop(draggingNode, dropNode) {
      let message = '是否将用户' + draggingNode.data['username'] + '加入到' + dropNode.data['title'] + '用户组中？'
      this.$confirm(message, '提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let params = {'guid': draggingNode.data['guid'], 'id': dropNode.data['id']}
        changeGroup(params).then((response) => {
          this.$message({type: response['type'], message: response['message']})
          if (response['type'] !== 'success') {
            let data = draggingNode.data
            for(let i=0; i<this.data.length; i++) {
              if ('children' in this.data[i]) {
                for (let j=0; j<this.data[i]['children'].length; j++) {
                  if (this.data[i]['children'][j]['guid'] === data['guid']) {
                    this.data[i]['children'].splice(j, 1)
                    break
                  }
                }
              }
            }
            this.$refs.userTree.append(data, this.lastParentNode)
          }
        })
      }).catch(() => {
        this.$message({type: 'warning', message: '您已取消该操作'})
        let data = draggingNode.data
        for(let i=0; i<this.data.length; i++) {
          if ('children' in this.data[i]) {
            for (let j=0; j<this.data[i]['children'].length; j++) {
              if (this.data[i]['children'][j]['guid'] === data['guid']) {
                this.data[i]['children'].splice(j, 1)
                break
              }
            }
          }
        }
        this.$refs.userTree.append(data, this.lastParentNode)
      })
    }
  }
}
function deepClone(target) {
  let result;
  if (typeof target === 'object') {
    if (Array.isArray(target)) {
      result = [];
      for (let i in target) {
        result.push(deepClone(target[i]))
      }
    } else if(target===null) {
      result = null;
    } else if(target.constructor===RegExp){
      result = target;
    }else {
      result = {};
      for (let i in target) {
        result[i] = deepClone(target[i]);
      }
    }
  } else {
    result = target;
  }
  return result;
}
function getDiff(array1, array2) {  // 输出在array1但不在array2中的元素
  let res = []
  for(let i=0; i<array1.length; i++) {
    if (array2.indexOf(array1[i]) < 0) {
      res.push(array1[i])
    }
  }
  return res
}
</script>

<style lang="scss" scoped>
.contextmenu {
  margin: 0;
  background: #fff;
  z-index: 3000;
  position: absolute;
  list-style-type: none;
  padding: 5px 0;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 400;
  color: #333;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);
li {
  margin: 0;
  padding: 7px 16px;
  cursor: pointer;
&:hover {
   background: #eee;
 }
}
}
</style>
