<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom: 10px">
      <el-input v-model="listQuery.name" :placeholder="$t('table.name')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.os" :placeholder="$t('table.os')" clearable style="width: 160px" class="filter-item">
        <el-option key="Linux" label="Linux" value="Linux" >
          <svg-icon icon-class="Linux" style="margin-right: 10px"/>
          <span>Linux</span>
        </el-option>
        <el-option key="Windows" label="Windows" value="Windows" >
          <svg-icon icon-class="Windows" style="margin-right: 10px"/>
          <span>Windows</span>
        </el-option>
      </el-select>
      <el-select v-model="status" :placeholder="$t('table.status')" clearable style="width: 120px" class="filter-item">
        <el-option key="1" label="运行中" value="1" />
        <el-option key="2" label="未连接" value="2" />
        <el-option key="3" label="已禁用" value="3" />
      </el-select>
      <el-button v-waves class="filter-item" style="margin-left: 10px;" size="medium" type="primary" plain icon="el-icon-search" @click="handleFilter">
        {{ $t('table.search') }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" size="medium" type="primary" plain icon="el-icon-edit-outline" @click="handleCreate">
        {{ $t('table.add') }}
      </el-button>
    </div>

    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column align="center" label="ID" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="120px" align="center" :label="$t('table.name')">
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <el-input v-model="row.name" class="edit-input" size="small"/>
          </template>
          <span v-else>{{ row.name}}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="180px" align="center" :label="$t('table.serverIntro')">
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <el-input v-model="row.description" class="edit-input" size="small" type="text"/>
          </template>
          <span v-else>{{ row.description }}</span>
        </template>
      </el-table-column>

      <el-table-column width="140px" align="center" :label="$t('table.os')">
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <el-select v-model="row.os" class="filter-item" size="small">
              <el-option key="1" label="Linux" value="Linux">
                <svg-icon icon-class="Linux" style="margin-right: 10px"/>
                <span>Linux</span>
              </el-option>
              <el-option key="2" label="Windows" value="Windows">
                <svg-icon icon-class="Windows" style="margin-right: 10px"/>
                <span>Windows</span>
              </el-option>
            </el-select>
          </template>
          <template v-else>
            <svg-icon v-if="row.state"  :icon-class="row.os" style="margin-right: 5px; font-size: 18px;"/>
            <svg-icon v-else :icon-class="row.os + '_grey'" style="margin-right: 5px; font-size: 18px;"/>
            <span>{{ row.os }}</span>
          </template>
        </template>
      </el-table-column>

      <el-table-column width="140px" align="center" :label="$t('table.ip')">
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <el-input v-model="row.ip" class="edit-input" size="small"/>
          </template>
          <span v-else>{{ row.ip }}</span>
        </template>
      </el-table-column>

      <el-table-column width="90px" align="center" :label="$t('table.port')">
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <el-input v-model="row.port" class="edit-input" type="number" size="small" min="0" max="65535"/>
          </template>
          <span v-else>{{ row.port }}</span>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" align="center" :label="$t('table.status')" width="110">
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <el-button type="success" size="small" @click="editUser(row)">修改用户</el-button>
          </template>
          <el-tag v-else :type="row.usage, row.state | stateFilter" :disable-transitions=true>
            {{ stateMap[row.usage][row.state] }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="$t('table.actions')" width="400">
        <template slot-scope="{row, $index}">
          <template v-if="!row.edit">
            <el-button v-if="!row.usage" type="primary" plain size="small" :icon="row.icon.enable" @click="ableServer(row)">
              {{ $t('table.enable') }}
            </el-button>
            <el-button v-else type="info" plain size="small" :icon="row.icon.disable" @click="ableServer(row)">
              {{ $t('table.disable') }}
            </el-button>
            <el-button type="success" plain size="small" icon="el-icon-edit" @click="editServer(row)">
              {{ $t('table.edit') }}
            </el-button>
            <el-button v-if="!row.state" type="primary" :disabled="!row.usage" plain size="small" :icon="row.icon.connect" @click="connectServer(row)">
              {{ $t('table.connect') }}
            </el-button>
            <el-button v-else type="warning" plain size="small" :icon="row.icon.closed" @click="disconnectServer(row)">
              {{ $t('table.disconnect') }}
            </el-button>
            <el-popover
              placement="top"
              width="180px"
              v-model="row.delVisible">
              <p>是否删除该测试节点？</p>
              <div style="text-align: right; margin: 0">
                <el-button size="mini" type="text" @click="deleteCancel(row)">取消</el-button>
                <el-button type="primary" size="mini" @click="handleDelete(row, $index)">确定</el-button>
              </div>
              <el-button slot="reference" size="small" type="danger" plain style="margin-left: 10px" :icon=row.icon.delete>
                {{ $t('table.delete') }}
              </el-button>
            </el-popover>
<!--            <el-button type="danger" plain size="small" icon="el-icon-delete">-->
<!--              {{ $t('table.delete') }}-->
<!--            </el-button>-->
          </template>
          <template v-else>
            <el-button type="primary" size="small" @click="confirmEdit(row)">
              {{ $t('table.save')}}
            </el-button>
            <el-button type="warning" size="small" @click="cancelEdit(row)">
              {{ $t('table.cancel')}}
            </el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>


    <el-dialog :title="$t('table.editUser')" :visible.sync="dialogFormVisible" width="500px" center :close-on-click-modal="false" @close="resetTemp()">
      <el-form ref="ruleForm" :rules="rules" :model="temp" label-position="right" label-width="80px" style="width: 400px; margin-left:20px;" size="small">
        <el-form-item v-if="temp.validation" :label="$t('table.path')" prop="path">
          <el-input v-model="temp.path"/>
        </el-form-item>
        <el-form-item v-if="!temp.validation" :label="$t('table.oldUsername')" prop="oldUsername">
          <el-input v-model="temp.oldUsername"/>
        </el-form-item>
        <el-form-item v-else :label="$t('table.newUsername')" prop="newUsername">
          <el-input v-model="temp.newUsername"/>
        </el-form-item>
        <el-form-item v-if="!temp.validation" :label="$t('table.oldPassword')" prop="oldPassword">
          <el-input type="password" v-model="temp.oldPassword"/>
        </el-form-item>
        <el-form-item v-else :label="$t('table.newPassword')" prop="newPassword">
          <el-input type="password" v-model="temp.newPassword"/>
        </el-form-item>
        <el-form-item v-if="temp.validation" :label="$t('table.secondPassword')" prop="secondPassword">
          <el-input type="password" v-model="temp.secondPassword"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-if="!temp.validation" type="primary" size="small" @click="validateUserInfo()">
          {{ $t('table.validate') }}
        </el-button>
        <el-button v-else type="primary" size="small" @click="saveUserInfo()">
          {{ $t('table.save') }}
        </el-button>
        <el-button @click="dialogFormVisible = false;resetTemp()" size="small">
          {{ $t('table.cancel') }}
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :title="$t('table.addServer')" :visible.sync="dialogCreateVisible" width="500px" center @close="resetTemp1()">
      <el-form ref="dataForm" :rules="rules1" :model="temp1" label-position="right" label-width="80px" style="width: 400px; margin-left:20px;" size="small">
        <el-form-item :label="$t('table.name')" prop="name">
          <el-input v-model="temp1.name" />
        </el-form-item>
        <el-form-item :label="$t('table.serverIntro')" prop="description">
          <el-input v-model="temp1.description" />
        </el-form-item>
        <el-form-item :label="$t('table.os')" prop="os">
          <el-radio-group v-model="temp1.os">
            <el-radio label="Linux">
              <svg-icon icon-class="Linux" style="margin-right: 8px"/>
              <span>Linux</span>
            </el-radio>
            <el-radio label="Windows">
              <svg-icon icon-class="Windows" style="margin-right: 8px"/>
              <span>Windows</span>
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('table.ip')" prop="ip">
          <el-input v-model="temp1.ip" style="width: 160px"/>
        </el-form-item>
        <el-form-item :label="$t('table.port')" prop="port">
          <el-input v-model="temp1.port" type="number" style="width: 120px" placeholder="ssh端口"/>
        </el-form-item>
        <el-form-item :label="$t('table.path')" prop="path">
          <el-input v-model="temp1.path" placeholder="绝对路径，以/为结尾"/>
        </el-form-item>
        <el-form-item :label="$t('table.username')" prop="username">
          <el-input v-model="temp1.username" placeholder="ssh用户登录名"/>
        </el-form-item>
        <el-form-item :label="$t('table.password')" prop="password">
          <el-input v-model="temp1.password" placeholder="ssh用户登录密码" type="password"/>
        </el-form-item>
        <el-form-item :label="$t('table.secondPassword')" prop="secondPassword">
          <el-input v-model="temp1.secondPassword" type="password" placeholder="重复密码"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="handleCreateServer()">
          {{ $t('table.save') }}
        </el-button>
        <el-button @click="dialogCreateVisible = false;resetTemp1()" size="small">
          {{ $t('table.cancel') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  connect,
  createServer,
  deleteServer,
  disconnect,
  editServer,
  fetchServer,
  usage,
  validateUser
} from '@/api/server'
import waves from '@/directive/waves'

export default {
  name: 'InlineEditTable',
  directives: { waves },
  filters: {
    stateFilter(usage, state) {
      if (usage === true) {
        if (state === true) {
          return 'primary'
        } else {
          return 'warning'

        }
      } else {
        return 'info'
      }
    }
  },
  data() {
    let validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.temp.newPassword) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    let validatePass1 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.temp1.password) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    return {
      icon: 'el-icon-close',
      dialogFormVisible: false,
      dialogCreateVisible: false,
      temp: {
        path: '',
        oldUsername: '',
        oldPassword: '',
        newUsername: '',
        newPassword: '',
        secondPassword: '',
        validation: false
      },
      temp1:{
        name: '',
        description: '',
        os: '',
        ip: '',
        port: '',
        path: '',
        username: '',
        password: '',
        secondPassword: ''
      },
      rules: {
        path: [{ required: true, message: '运行目录为必填项', trigger: 'blur' }],
        oldUsername: [{ required: true, message: '用户名为必填项', trigger: 'blur' }],
        oldPassword: [{ required: true, message: '密码为必填项', trigger: 'blur' }],
        newUsername: [{ required: true, message: '用户名为必填项', trigger: 'blur' }],
        newPassword: [{ required: true, message: '密码为必填项', trigger: 'blur' }],
        secondPassword: [{required: true, validator: validatePass, trigger: 'blur'}]
      },
      rules1: {
        name: [{ required: true, message: '节点名称为必填项', trigger: 'blur' }],
        description: [{ required: true, message: '介绍为必填项', trigger: 'blur' }],
        os: [{ required: true, message: '操作系统为必选项', trigger: 'blur' }],
        ip: [{ required: true, message: 'IP地址为必填项', trigger: 'blur' }],
        port: [{ required: true, message: '端口为必填项', trigger: 'blur' }],
        path: [{ required: true, message: '运行目录为必填项', trigger: 'blur' }],
        username: [{ required: true, message: '用户名为必填项', trigger: 'blur' }],
        password: [{ required: true, message: '密码为必填项', trigger: 'blur' }],
        secondPassword: [{required: true, validator: validatePass1, trigger: 'blur'}]
      },
      list: null,
      listLoading: false,
      status: undefined,
      listQuery: {
        name: undefined,
        os: undefined,
        usage: undefined,
        state: undefined
      },
      stateMap: {
        true: {
          true: '运行中',
          false: '未连接',
          null: '未连接'
        },
        false: {
          false: '已禁用',
          null: '已禁用'
        }
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.listLoading = true
      switch (this.status) {
        case "1":
          this.listQuery.usage = true;
          this.listQuery.state = true;
          break
        case "2":
          this.listQuery.usage = true;
          this.listQuery.state = false;
          break
        case "3":
          this.listQuery.usage = false;
          this.listQuery.state = undefined;
          break
        default:
          this.listQuery.usage = undefined;
          this.listQuery.state = undefined;
      }
      fetchServer(this.listQuery).then((response) => {
        this.list = response.data
        for(let i=0; i<this.list.length; i++) {
          this.list[i]['icon'] = []
          this.list[i]['icon']['closed'] = 'el-icon-close'
          this.list[i]['icon']['connect'] = 'el-icon-check'
          this.list[i]['icon']['enable'] = 'el-icon-switch-button'
          this.list[i]['icon']['disable'] = 'el-icon-switch-button'
          this.list[i]['icon']['delete'] = 'el-icon-delete'
          this.list[i]['edit'] = false
        }
        this.listLoading = false
      })
    },
    cancelEdit(row) {
      row.edit = false
      row.name = row.original.name
      row.description = row.original.description
      row.os = row.original.os
      row.ip = row.original.ip
      row.port = row.original.port
      this.$message({
        message: '您已取消编辑节点信息',
        type: 'warning'
      })
      this.list.splice(this.list.indexOf(row), 1, row)
    },
    confirmEdit(row) {
      let tempData
      tempData = Object.assign({}, tempData, row)
      delete tempData.closed
      delete tempData.connect
      delete tempData.state
      delete tempData.usage
      delete tempData.original
      delete tempData.edit
      console.log('tempData:', tempData)
      editServer(tempData).then((response) => {
        this.$message({message: response['message'], type: response['type']})
        if(response['type'] === 'success') {
          row.edit = false
          this.list.splice(this.list.indexOf(row), 1, row)
        }
      })
    },
    ableServer(row) {
      let icon_bak1 = row.icon.enable
      let icon_bak2 = row.icon.disable
      row.icon.enable = 'el-icon-loading'
      row.icon.disable = 'el-icon-loading'
      this.list.splice(this.list.indexOf(row), 1, row)
      let param = {'id': row.id, 'usage': !row.usage}
      usage(param).then((response) => {
        if(response['message'] === 'success') {
          row.usage = !row.usage
        } else {
          this.$message.error({message: response['message']})
        }
        row.icon.enable = icon_bak1
        row.icon.disable = icon_bak2
        this.list.splice(this.list.indexOf(row), 1, row)
      })
    },
    connectServer(row) {
      let icon_bak = row.icon.connect
      row.icon.connect = 'el-icon-loading'
      this.list.splice(this.list.indexOf(row), 1, row)
      let stateMap = {
        true: 'success',
        false: 'warning'
      }
      connect(row.id).then((response) => {
        this.$message({message: response['message'], type: stateMap[response['type']]})
        if(response['type']) {
          row.state = true
        }
        row.icon.connect = icon_bak
        this.list.splice(this.list.indexOf(row), 1, row)
      })
    },
    disconnectServer(row) {
      let icon_bak = row.icon.closed
      row.icon.closed = 'el-icon-loading'
      this.list.splice(this.list.indexOf(row), 1, row)
      let stateMap = {
        true: 'success',
        false: 'warning'
      }
      disconnect(row.id).then((response) => {
        this.$message({message: response['message'], type: stateMap[response['type']]})
        if(response['type']) {
          row.state = false
        }
        row.icon.closed = icon_bak
        this.list.splice(this.list.indexOf(row), 1, row)
      })
    },
    editServer(row) {
      if (row.usage) {
        this.$message.error({message: '编辑节点信息需先禁用该节点'})
        return
      }
      delete row.original
      row.original = Object.assign({}, row.original, row)
      row.edit=!row.edit
      this.list.splice(this.list.indexOf(row), 1, row)
    },
    editUser(row) {
      this.dialogFormVisible = true
      this.temp.id = row.id
    },
    resetTemp() {
      this.temp= {
        path: '',
        oldUsername: '',
        oldPassword: '',
        newUsername: '',
        newPassword: '',
        secondPassword: '',
        validation: false
      }
    },
    resetTemp1() {
      this.temp1= {
        name: '',
        description: '',
        os: '',
        ip: '',
        port: '',
        path: '',
        username: '',
        password: '',
        secondPassword: ''
      }
    },
    validateUserInfo() {
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          let data = {'username': this.temp.oldUsername, 'password': this.temp.oldPassword}
          validateUser(this.temp.id, data).then((response) => {
            if (response['message'] === 'success') {
              this.temp.validation = true
              this.temp.token = response['data']
              this.temp.path = response['path']
            } else {
              this.$message.error({message: response['message']})
            }
          })
        }
      })
    },
    saveUserInfo() {
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          let data = {'username': this.temp.newUsername, 'password': this.temp.newPassword,
            'path': this.temp.path, 'token': this.temp.token}
          validateUser(this.temp.id, data).then((response) => {
            this.$message({message: response['message'], type: response['type']})
            if(response['type'] === 'success') {
              this.dialogFormVisible = false
              this.resetTemp()
            }
          })
        }
      })
    },
    handleCreateServer() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid){
          let tempData = Object.assign({}, this.temp1)
          delete tempData.secondPassword
          createServer(tempData).then((response) => {
            this.$message({message: response['message'], type: response['type']})
            if(response['type'] === 'success') {
              this.getList()
              this.dialogCreateVisible = false
              this.resetTemp1()
            }
          })
        }
      })
    },
    deleteCancel(row) {
      row.delVisible=false
      const index = this.list.indexOf(row)
      this.$set(this.list, index, this.list[index])
    },
    handleDelete(row, index) {
      if (row.usage) {
        this.$message.error({message: '删除节点需先禁用该节点'})
        return
      }
      let icon_bak = row.icon.delete
      row.icon.delete = 'el-icon-loading'
      row.delVisible=false
      console.log('index:', index, 'list', this.list)
      deleteServer(row.id).then((response) => {
        this.$message({message: response['message'], type: response['type']})
        if(response['type'] === 'success') {
          this.list.splice(index, 1)
        }
        row.icon.delete = icon_bak
      })
    },
    handleFilter() {
      this.getList()
    },
    handleCreate() {
      this.resetTemp1()
      this.dialogCreateVisible = true
    }
  }
}
</script>

