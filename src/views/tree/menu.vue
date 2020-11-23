<template>
  <div class="app-container">
    <el-container direction="vertical">
      <el-main>
        <el-col :offset="1" :span="8">
            <el-tree
              ref="menuTree"
              node-key="id"
              :data="data"
              :props="defaultProps"
              :highlight-current="true"
              :expand-on-click-node="false"
              :draggable="true"
              class="el-tree el-tree--highlight-current"
              @node-expand="closeMenu"
              @node-collapse="closeMenu"
              @node-click="click"
              @node-contextmenu="openMenu"
            >
              <span slot-scope="{ node, data }" class="custom-tree-node" :style="editColor(data)">
                <el-icon v-if="data.icon.includes('el-icon')" :class="data.icon" style="margin-right: 10px;"></el-icon>
                <svg-icon v-else :icon-class="data.icon" style="margin-right: 10px"></svg-icon>
                <span>{{node.label}}</span>
              </span>
            </el-tree>
        </el-col>

        <el-col :span="10" :offset="3">
            <el-form ref="dataForm"
                     :model="temp"
                     v-show="editVisible"
                     v-loading="loading"
                     label-position="right"
                     label-width="80px"
                     :rules="rules"
                     size="small"
                     style="width: 400px">
              <el-form-item :label="$t('menu.title')" prop="title">
                <el-input v-model="temp.title" />
              </el-form-item>
              <el-form-item :label="$t('menu.icon')" prop="icon">
                <el-icon v-if="temp.icon.includes('el-icon')" :class="temp.icon" style="margin-left: 5px; font-size: 18px; margin-right: 15px; color: #606266"></el-icon>
                <svg-icon v-else :icon-class="temp.icon" style="margin-left: 5px; font-size: 18px; margin-right: 15px; color: #606266"/>
                <el-popover
                  placement="bottom"
                  trigger="click"
                  v-model="popVisible">
                  <div  style="width: 410px;">
                    <div v-for="item of elementIcons" :key="item" class="icon-item" @click="selectIcon(item)">
                        <i :title="item" :class="'el-icon-' + item"/>
                    </div>
                  </div>
                  <el-button slot="reference">...</el-button>
                </el-popover>
              </el-form-item>
              <el-form-item v-if="groupId===0" :label="$t('menu.name')" prop="name">
                <el-input v-model="temp.name" />
              </el-form-item>
              <el-form-item :label="$t('menu.path')" prop="path">
                <el-input v-model="temp.path" placeholder="仅根节点以/开始，其他节点无需以/开始"/>
              </el-form-item>
              <el-form-item :label="$t('menu.component')" prop="component">
                <el-input v-if="groupId===0" v-model="temp.component" />
                <el-radio-group v-else v-model="temp.component">
                  <el-radio label="tree">文件夹</el-radio>
                  <el-radio label="table/complex-table">叶子节点</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item v-if="groupId===0" :label="$t('menu.redirect')" prop="redirect">
                <el-input v-model="temp.redirect" />
              </el-form-item>
            </el-form>
        </el-col>
      </el-main>
      <el-footer>
        <el-row>
          <el-col :offset="6" :span="1">
            <el-button type="primary" size="small" @click="submit()">提交</el-button>
          </el-col>
          <el-col :offset="8" :span="4">
            <el-button v-show="editVisible" type="primary" size="small" @click="editMenu()">
              {{ $t('menu.save') }}
            </el-button>
            <el-button v-show="editVisible" size="small" @click="resetTemp()">
              {{ $t('menu.cancel') }}
            </el-button>
          </el-col>
        </el-row>
      </el-footer>
    </el-container>
    <ul v-show="visible" :style="{left:left+'px',top:top+'px'}" class="contextmenu">
      <li @click="addMenu(false)">添加菜单</li>
      <li @click="addChildMenu">添加子菜单</li>
      <li @click="deleteMenu">删除菜单</li>
    </ul>
  </div>
</template>

<script>
import {fetchMenus, getMenuInfo, updateMenu} from "@/api/menu";
import elementIcons from "@/icons/element-icons";

export default {
  name: 'menuTree',
  data(){
    return {
      elementIcons,
      popVisible: false,
      editData: [],
      deleteIds: [],
      originalData: [],
      data: [{
        icon: ''
      }],
      groupId: undefined,
      rules: {
        title: [{required: true, message: '菜单名称为必填项', trigger: 'change'}],
        icon: [{required: true, message: '菜单图标为必选项', trigger: 'change'}],
        name: [{required: true, message: '路由名称为必填项', trigger: 'change'}],
        path: [{required: true, message: '路径为必填项', trigger: 'change'}],
        component: [{required: true, message: '组件类型为必选项', trigger: 'change'}],
      },
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      top: 0,
      left: 0,
      visible: false,
      loading: false,
      editVisible: false,
      temp: {
        icon: ''
      },
      selectedNode: Object,
      newNode: [],
      lastSelectedKey: undefined,
      formState: '',
      originalForm: '',
      updateData: [],
    }
  },
  created() {
    this.fetchData()
  },
  watch: {
    visible(value) {
      if (value) {
        document.body.addEventListener('click', this.closeMenu)
      } else {
        document.body.removeEventListener('click', this.closeMenu)
      }
    }
  },
  methods: {
    fetchData() {
      fetchMenus().then((response) => {
        this.originalData = deepClone(response.data)
        this.data = response.data
        this.groupId = response['groupId']
        this.updateData = []
        JSON2Array(this.data, this.updateData)
      })
    },
    openMenu(event, obj, node) {
      const menuMinWidth = 105
      const offsetLeft = this.$el.getBoundingClientRect().left // container margin left
      const offsetWidth = this.$el.offsetWidth // container width
      const maxLeft = offsetWidth - menuMinWidth // left boundary
      const left = event.clientX - offsetLeft // 15: margin right
      if (left > maxLeft) {
        this.left = maxLeft
      } else {
        this.left = left
      }
      this.top = event.pageY - 85
      this.visible = true
      this.selectedNode = node
    },
    closeMenu() {
      if (this.visible) {
        this.visible = false
      }
      if (this.popVisible) {
        this.popVisible = false
      }
    },
    click(data){
      this.loading = true
      this.closeMenu()
      let id = data.id
      if(this.lastSelectedKey === this.$refs.menuTree.getCurrentKey()) {  // 取消选中
        this.$refs.menuTree.setCurrentKey(null)
        this.lastSelectedKey = undefined
        this.editVisible = false
        this.loading = false
        return
      }
      this.lastSelectedKey = id
      let info = findData(this.editData, id)
      if (info) {
        this.temp = info
        this.editVisible = true
        this.loading = false
      } else {
        if (id > 0) {
          getMenuInfo(id).then((response) => {
            if (!info) {
              this.temp = response.data
            }
            this.originalForm = JSON.stringify(response.data)
            this.editVisible = true
            this.loading = false
          })
        } else {
          this.temp = {'id': id, icon: ''}
          this.originalForm = JSON.stringify({'id': id, icon: ''})
          this.editVisible = true
          this.loading = false
        }
      }
      this.formState = 'edit'

    },
    editMenu() {
      let id = this.temp.id
      if (this.groupId !== 0) {
        this.temp.name = this.temp.path + '_name'
        this.temp.redirect = ''
      }
      this.$refs.dataForm.validate((valid) => {
        if (valid) {
          if (findData(this.editData, id)) {  // 添加到编辑数组之前需删除之前编辑的数据
            for(let i=0; i<this.editData.length; i++) {
              if (this.editData[i].id === id) {
                this.editData.splice(i, 1)
                i -= 1
              }
            }
          }
          if (this.originalForm !== JSON.stringify(this.temp)) {
            this.editData.push(deepClone(this.temp))
            this.$message({type: 'success', message: '数据已保存，编辑完成后请提交至后台'})
          }
          let node = this.$refs.menuTree.getNode(id)
          node.data.title = this.temp.title
          node.data.icon = this.temp.icon
        }
      })
    },
    resetTemp() {
      this.editVisible = false
    },
    selectIcon(icon) {
      this.temp.icon = 'el-icon-' + icon
      this.popVisible = false
    },
    addMenu(child) {
      this.formState = 'create'
      this.editVisible = true
      // let temp = [];
      // JSON2Array(this.data, temp, 0)
      // let count = temp.filter(function (value) { return value.id < 0 }).length
      // let data = {id: -1 - count, title: '', icon: '', name: '', path: '', component: '', redirect: ''}
      let data = {id: -1 - this.editData.length, title: '新增节点' + (1 + this.editData.length), icon: 'el-icon-document', name: '',
                  path: '', component: '', redirect: ''}
      this.editData.push(data)
      this.originalForm = JSON.stringify(data)
      this.temp = Object.assign({}, data)
      if (child){
        this.$refs.menuTree.append({id: data.id, title: data.title, icon: data.icon}, this.selectedNode)
      } else {
        this.$refs.menuTree.insertAfter({id: data.id, title: data.title, icon: data.icon}, this.selectedNode)
      }
      this.selectedNode = this.$refs.menuTree.getNode(data)
    },
    addChildMenu() {
      this.addMenu(true)
    },
    deleteMenu() {  // 如果删除的节点含有子节点，是否删除，如果子节点中有数据，是否删除？
      let child = [this.selectedNode['data']]
      while(child.length) {
        if (child[0].id > 0) {
          this.deleteIds.push(child[0].id)
        } else {
          for (let i=0; i<this.editData.length; i++) {
            if (this.editData[i].id === child[0].id) {
              this.editData.splice(i, 1)
              i -= 1
            }
          }
        }
        if (child[0].children) {
          child[0].children.forEach(function (item) {
            child.push(item)
          })
        }
        child.shift()
      }
      // this.deleteIds.push(this.selectedNode['data'].id)
      this.$refs.menuTree.remove(this.selectedNode)
    },
    editColor(data) {  // 修改信息后的数据变蓝
      for (let i=0; i<this.editData.length; i++) {
        if (this.editData[i].id === data.id) {
          return 'color: #409EFF'
        }
      }
      return 'color: #606266'
    },
    validate(editData) {
      let result = []
      editData.forEach(function (item) {
        if (item.title === '' || item.icon === '' || item.component === '' || item.name === '' || item.path === '') {
          result.push(item.id)
        }
      })
      if (result.length > 0) {
        return result
      } else {
        return true
      }
    },
    submit() {
      let validateRes = this.validate(this.editData)
      if (validateRes !== true) {
        this.$message.error('添加的菜单项不得为空')
        this.$refs.menuTree.setCurrentKey(validateRes[0])
        return
      }
      this.newData = []
      JSON2Array(this.data, this.newData, 0, true)
      console.log('originalData, newData:', this.updateData, this.newData)
      let orderData = getDiff(this.updateData, this.newData)
      let data = {}
      if (this.editData.length > 0) {
        data['edit'] = this.editData
      }
      if (orderData.length > 0) {
        data['order'] = orderData
      }
      if (this.deleteIds.length > 0) {
        data['delete'] = this.deleteIds
      }
      if (Object.keys(data).length > 0) {
        let text = '是否确认提交数据？'
        if (this.deleteIds.length > 0) {
          text = '若菜单中含有测试数据，则会被一并删除，是否确认提交？'
        }
        this.$confirm(text, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          updateMenu(data).then((response) => {
            this.$message({type: response['type'], message: response['message']})
            let new_data = response['data']
            for (let i=0; i<orderData.length; i++) {
              findData(this.data, orderData[i]['id'])['order'] = orderData[i]['order']
            }
            for (let key in new_data) {
              findData(this.data, parseInt(key))['id'] = new_data[key]
            }
            this.updateData = []
            JSON2Array(this.data, this.updateData)
            this.deleteIds = []
            this.editData = []
          })
        }).catch(() => {this.$message({type: 'info', message: '已取消提交'})})
      } else {
        this.$message({type: 'info', message:'您尚未修改任何内容'})
      }
    }
  }
}
function getDiff(arr1, arr2) {
  let res = [], res1 = [], res2 = []
  arr1.forEach(function (item, index) {
    res1[index] = JSON.stringify(item)
  })
  arr2.forEach(function (item, index) {
    res2[index] = JSON.stringify(item)
  })
  for(let i=0; i<res2.length; i++) {
    if (res1.indexOf(res2[i]) < 0) {
      res.push(arr2[i])
    }
  }
  return res
}
function JSON2Array(data, array, parentId=0, reorder=false) {
  for(let i=0; i<data.length; i++) {
    array.push({'id': data[i].id, 'parentId': parentId, 'order': reorder? i + 1 : data[i].order})
    if(data[i].children) {
      JSON2Array(data[i].children, array, data[i].id, reorder)
    }
  }
}
function findData(data, id) {
  for(let i=0; i<data.length; i++) {
    if (data[i].id === id) {
      return data[i]
    } else {
      if (data[i].children) {
        let res = findData(data[i].children, id)
        if (res !== null) {
          return res
        }
      }
    }
  }
  return null
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
.icon-item {
  margin: 6px;
  height: 10px;
  text-align: center;
  width: 15px;
  float: left;
  font-size: 18px;
  color: #606266;
  cursor: pointer;
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  font-size: 14px;
  padding-right: 8px;
}
</style>
