<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom: 10px">
      <el-input v-model="listQuery.title" :placeholder="$t('table.title')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.server" :placeholder="$t('table.server')" clearable style="width: 120px" class="filter-item">
        <el-tooltip
          v-for="item in serverOptions"
          :content="item.description"
          class="item"
          effect="dark"
          placement="right"
        >
          <el-option :key="item.id" :label="item.name" :value="item.id" >
            <svg-icon v-if="item.state" :icon-class="item.os" style="margin-right: 10px"/>
            <svg-icon v-else :icon-class="item.os + '_grey'" style="margin-right: 10px"/>
            <span>{{item.name}}</span>
          </el-option>
        </el-tooltip>
      </el-select>
      <el-select v-model="listQuery.status" :placeholder="$t('table.status')" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in statusOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" :placeholder="$t('table.id_sort')" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" style="margin-left: 10px;" size="medium" type="primary" icon="el-icon-search" @click="handleFilter">
        {{ $t('table.search') }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" size="medium" type="primary" icon="el-icon-edit-outline" @click="handleCreate">
        {{ $t('table.add') }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" size="medium" type="primary" icon="el-icon-video-play" @click="runSelected">
        {{ $t('table.runSelected') }}
      </el-button>
      <el-checkbox v-model="showUploader" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">
        {{ $t('table.uploader') }}
      </el-checkbox>
    </div>
    <!--以下是表格样式编辑-->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      :row-class-name="tableRowClassName"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" align="center" width="50" />
      <el-table-column :label="$t('table.id')" prop="id" sortable="custom" align="center" width="60" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.title')" min-width="80px" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.intro')" min-width="220px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.description }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.server')" min-width="220px" align="center">
        <template slot-scope="{row}">
          <el-select v-model="row.selectedServers" placeholder="选择节点进行测试" collapse-tags multiple width="160px" @change="selectedServer(row, 'run') ">
            <el-tooltip v-for="item in row.server" :content="item.description" class="item" effect="dark" placement="right">
              <el-option :key="item.id" :label="item.name" :value="item.id" :disabled="!item.state">
                <svg-icon v-if="item.state" :icon-class="item.os" style="margin-right: 10px"/>
                <svg-icon v-else :icon-class="item.os + '_grey'" style="margin-right: 10px"/>
                <span>{{item.name}}</span>
              </el-option>
            </el-tooltip>
            <el-option key="all" label="全选/反选" value="all" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.params')" min-width="170px" align="center">
        <template slot-scope="{row}">
          <el-select
            v-model="row.selectedParam"
            :disabled="row.selectedParam==='None'"
            clearable
            filterable
            allow-create
            placeholder="输入自定义参数"
            @change="paramChange(row)"
          >
            <el-option v-for="item in row.params" :key="item" :label="item" :value="item" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.date')" min-width="155px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.lastExecuteTime }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="showUploader" :label="$t('table.uploader')" min-width="70px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.uploader }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.status')" class-name="status-col" min-width="95" align="center">
        <template slot-scope="{row}">
          <el-tag :v-model="row.result" style="cursor:pointer" :type="row.status | statusFilter" effect="light" @click="viewResult(row)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" min-width="210" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button size="small" type="primary" @click="runCommand(row)">
            {{ $t('table.run') }}
          </el-button>
          <el-button type="success" size="small" @click="handleUpdate(row)">
            {{ $t('table.edit') }}
          </el-button>
          <el-popover
            placement="top"
            width="160"
            v-model="row.delVisible">
            <p>是否删除此测试项？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="deleteCancel(row)">取消</el-button>
              <el-button type="primary" size="mini" @click="handleDelete(row,$index)">确定</el-button>
            </div>
            <el-button slot="reference" size="small" type="danger" style="margin-left: 10px" @click="deleteUpdate(row)">
              {{ $t('table.delete') }}
            </el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="500px" center :close-on-click-modal="false">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="80px" style="width: 400px; margin-left:20px;" size="small">
        <el-form-item :label="$t('table.type')" prop="type">
          <el-select v-model="temp.type" class="filter-item">
            <el-option v-for="item in menuOptions" :key="item.id" :label="item.title" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('table.title')" prop="title">
          <el-input v-model="temp.title" />
        </el-form-item>
        <el-form-item :label="$t('table.intro')" prop="intro">
          <el-input v-model="temp.description" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="请输入测试项介绍"/>
        </el-form-item>
        <el-form-item :label="$t('table.server')">
          <el-select v-model="temp.selectedServers" placeholder="选择部署节点" collapse-tags multiple @change="selectedServer(temp, 'develop')">
            <el-tooltip v-for="item in temp.server" :content="item.description" class="item" effect="dark" placement="right">
              <el-option :key="item.id" :label="item.name" :value="item.id" >
                <svg-icon :icon-class="item.os" style="margin-right: 10px"/>
                <span>{{item.name}}</span>
              </el-option>
            </el-tooltip>
            <el-option key="all" label="全选/反选" value="all" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('table.command')" prop="command">
          <el-input v-model="temp.command" placeholder="请填写执行命令，如：dig,python等" />
        </el-form-item>
        <el-form-item :label="$t('table.params')">
          <el-input v-model="temp.params" placeholder="参数之间使用;分隔，若无参数选项请填写None" />
        </el-form-item>
        <el-form-item :label="$t('table.script')">
          <el-upload class="upload-demo"
                     action="api/item/script/upload/"
                     :data="{'guid': temp.guid}"
                     :file-list="temp.script"
                     :on-change="scriptUpload"
                     :on-remove="uploadRemove">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">{{$t('table.upload_tips')}}</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="dialogStatus==='create'?createData():updateData()">
          {{ $t('table.save') }}
        </el-button>
        <el-button @click="dialogFormVisible = false" size="small">
          {{ $t('table.cancel') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {fetchItems, queryMenus, queryServers, runItem, updateItem, createItem, deleteItem} from '@/api/item'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'


export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        '查看结果': '', // 2
        '运行中': 'success', // 1
        '尚未运行': 'info', // 0
        '失败': 'danger' // -1
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        title: undefined,
        type: undefined,
        sort: undefined,
        menuId: undefined,
        selectedServers: []
      },
      multipleSelection: [],
      serverOptions: [],
      menuOptions: [],
      sortOptions: [{ label: 'ID增序', key: '+id' }, { label: 'ID降序', key: '-id' }],
      statusOptions: [{ label: '成功', key: 2 }, { label: '运行中', key: 1 }, { label: '尚未运行', key: 0 }, { label: '失败', key: -1 }],
      showUploader: false,
      temp: {
        title: '',
        description: '',
        type: '',
        server: undefined,
        selectedServers: undefined,
        params: '',
        script: []
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '添加'
      },
      rules: {
        type: [{ required: true, message: '项目类型为必填项', trigger: 'change' }],
        title: [{ required: true, message: '项目名称为必填项', trigger: 'change' }],
        command: [{ required: true, message: '运行命令为必填项', trigger: 'change' }]
      },
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listQuery.menuId = this.$route.query.id
      this.listLoading = true
      fetchItems(this.listQuery).then(response => {
        if(response.data === null) {
          this.listLoading = false
          return
        }
        this.list = response.data.items
        for (let i = 0, len = response.data.items.length; i < len; i++) {
          this.list[i].status = '尚未运行'
          this.list[i].params = String(this.list[i].params).split(';')
          this.list[i].selectedParam = this.list[i].params[0]
          // this.list[i].delVisible = true
          this.serverOptions = this.serverOptions.concat(this.list[i].server)
        }
        this.serverOptions = uniq(this.serverOptions)
        this.total = response.data.total
        this.listLoading = false
      })
      // fetchList(this.listQuery).then(response => {
      //   this.list = response.data.items
      //   this.total = response.data.total
      //
      //   // Just to simulate the time of the request
      //   setTimeout(() => {
      //     this.listLoading = false
      //   }, 1.5 * 1000)
      // })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = 'id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        guid: '',
        id: undefined,
        type: '',
        title: '',
        description: '',
        command: '',
        params: '',
        script: [],
        server: [],
        selectedServers: []
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.developedServer()
      this.getAllMenus()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          delete tempData.guid
          delete tempData.id
          if (tempData.script.length > 0){
            const script = tempData.script[0]
            tempData.script = {'name': script.name, 'path': ''}
            if ('response' in script) {
              tempData.script = {'name': script.name, 'path': script.response.path}
            }
          } else {
            tempData.script = {'name': '', 'path': ''}
          }
          delete tempData.server
          createItem(tempData).then((response) => {
            let data = response.data
            data.status = '尚未运行'
            data.params = String(data.params).split(';')
            data.selectedParam = data.params[0]
            this.serverOptions = this.serverOptions.concat(data.server)
            this.serverOptions = uniq(this.serverOptions)
            if(this.listQuery.menuId === data.type) {
              this.list.push(data)
            }
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.params = this.temp.params.join(';')
      if(this.temp.script === '') {
        this.temp.script = []
      } else {
        this.temp.script = [{'name': this.temp.script}]
      }
      this.developedServer(row)
      this.getAllMenus()
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      delete this.temp.status
      delete this.temp.uploader
      delete this.temp.selectedParam
      delete this.temp.lastExecuteTime
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          if (tempData.script.length > 0){
            const script = tempData.script[0]
            tempData.script = {'name': script.name, 'path': ''}
            if ('response' in script) {
              tempData.script = {'name': script.name, 'path': script.response.path}
            }
          } else {
            tempData.script = {'name': '', 'path': ''}
          }
          delete tempData.server
          updateItem(tempData).then((response) => {
            const data = response.data
            // delete data.type
            data['status'] = '尚未运行'
            data.params = String(data.params).split(';')
            data.selectedParam = data.params[0]
            data.selectedServers = []
            this.serverOptions = this.serverOptions.concat(data.server)
            this.serverOptions = uniq(this.serverOptions)
            const index = this.list.findIndex(v => v.id === data.id)
            this.list.splice(index, 1, data)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            },
            )
          })
        }
      })
    },
    handleDelete(row, index) {
      deleteItem({'guid': row['guid']}).then((response) => {
        if(response['msg'] === 'success') {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          row.delVisible = false
          this.list.splice(index, 1)
        } else {
          this.$notify.error({
            title: '失败',
            message: '删除失败',
            duration: 2000
          })
        }
      })
    },
    deleteCancel(row) {
      row.delVisible=false
      const index = this.list.indexOf(row)
      this.$set(this.list, index, this.list[index])
    },
    deleteUpdate(row) {
      row.delVisible=false
      const index = this.list.indexOf(row)
      this.$set(this.list, index, this.list[index])
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    },
    selectedServer(row, state) {
      let allServers;
      if (state === 'run') {
        allServers = row.server.filter(item => item.state).map(item => item.id)  // 执行状态全选测试节点不可选择离线节点
      } else {
        allServers = row.server.map(item => item.id)  // 部署状态全选节点可选择离线节点
      }
      if (row.selectedServers.indexOf('all') !== -1) {
        if (row.selectedServers.length === allServers.length + 1) {
          row.selectedServers = []
        } else {
          row.selectedServers = allServers
        }
      }
    },
    paramChange(row) {
      this.list.splice(this.list.indexOf(row), 1, row)
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    runCommand(row) {
      let query = {}
      query.guid = row.guid
      if (row.selectedServers.length <= 0) {
        this.$message({ message: '请至少选择一个测试节点', type: 'warning' })
        return
      }
      query.position = row.selectedServers.join(',')
      query.param = ''
      if (row.selectedParam !== 'None') {
        query.param = row.selectedParam
      }
      row.status = '运行中'
      this.list.splice(this.list.indexOf(row), 1, row)
      query = JSON.stringify(query)
      runItem(query).then(response => {
        const type = response['type']
        if (type === 'success') {
          row.result = response.data
          row.status = '查看结果'
          row.lastExecuteTime = response['now']
          this.list.splice(this.list.indexOf(row), 1, row)
          this.$message.success(row.title + '完成测试！')
        }
        if (type === 'fail') {
          row.result = response['message']
          row.status = '失败'
          this.list.splice(this.list.indexOf(row), 1, row)
          this.$message.error(row.result)
        }
      })
    },
    tableRowClassName(row, rowIndex) {
      row.index = rowIndex
    },
    viewResult(row) {
      switch (row.status) {
        case '尚未运行':
          this.$message({ message: '请先执行测试项', type: 'warning' })
          return
        case '运行中':
          this.$message({ message: '正在运行测试项中，请稍等', type: 'warning' })
          return
        case '查看结果':
          break
        default:
          this.$message.error(row.result)
          return
      }
      const name = []; const result = []
      for (let i = 0; i < row.result.length; i++) {
        name[i] = row.server.filter(item => item.id === Number(row.result[i].id))[0].name
        result[i] = row.result[i].result
      }
      const i = 0
      this.msg(name, result, i)
    },
    msg(name, result, index) {
      let cancelText = '上一项'
      let confirmText = '下一项'
      if (index === 0) { cancelText = '关闭' }
      if (index === name.length - 1) { confirmText = '确定' }
      this.$msgbox({
        title: name[index] + '执行结果',
        message: this.$createElement('span', { style: 'text-align:left;display:inline-block;word-wrap:break-word;white-space:pre-line;' }, result[index]),
        distinguishCancelAndClose: true,
        showCancelButton: true,
        cancelButtonText: cancelText,
        confirmButtonText: confirmText,
        center: true,
        cancelButtonClass: 'el-button el-button--default el-button--small el-button--primary'
      }).then(action => {
        if (index < name.length - 1) {
          this.msg(name, result, index + 1)
        }
      }).catch(action => {
        if (action === 'close') {
          return
        }
        if (index > 0) {
          this.msg(name, result, index - 1)
        }
      })
    },
    developedServer(row) {
      queryServers({ param: 'all' }).then(response => {
        this.temp.server = response.data
        if (arguments.length === 1) {
          this.temp.selectedServers = row.server.map(item => item.id)
        }
      })
    },
    scriptUpload(file, script) {
      this.temp.script = script.slice(-1)
    },
    uploadRemove(file) {
      this.temp.script.splice(this.temp.script.findIndex(v => v.name === file.name), 1)
    },
    getAllMenus() {
      queryMenus().then(response => {
        this.menuOptions = response.data
      })
    },
    runSelected() {
      let unselectedServer
      for( let i=0; i<this.multipleSelection.length; i++) {
        if(this.multipleSelection[i].selectedServers.length === 0) {
          unselectedServer.push(this.multipleSelection[i].title)
        }
      }
      if(unselectedServer.length > 0) {
        let msg = "请选择{}运行的测试节点";
        msg = msg.replace('{}', unselectedServer.join('、'))
        this.$message({ message: msg, type: 'warning' })
      } else {
        for( let i=0; i<this.multipleSelection.length; i++) {
          this.runCommand(this.multipleSelection[i])
        }
      }
    }
  }
}
function uniq(array) {
  const res = new Map()
  return array.filter((a) => !res.has(a.id) && res.set(a.id, 1))
}
</script>
