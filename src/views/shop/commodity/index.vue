<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="商品名" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入商品名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品价格" prop="price">
        <el-input
          v-model="queryParams.price"
          placeholder="请输入商品价格"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品库存" prop="stock">
        <el-input
          v-model="queryParams.stock"
          placeholder="请输入商品库存"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品状态" prop="state">
        <el-select v-model="queryParams.state" placeholder="请选择商品状态" clearable>
          <el-option
            v-for="dict in dict.type.shop_commodity_state"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['shop:commodity:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['shop:commodity:edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['shop:commodity:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['shop:commodity:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="commodityList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <!--      <el-table-column label="id" align="center" prop="id"/>-->
      <el-table-column label="商品名" align="center" prop="name"/>
      <el-table-column label="商品价格" align="center" prop="price"/>
      <el-table-column label="商品库存" align="center" prop="stock"/>
      <el-table-column label="商品内容" align="center" prop="content"/>
      <el-table-column label="商品选项" align="center" prop="opt">
        <template slot-scope="scope">
          {{ traverseOpt(scope.row.opt, '') }}
        </template>
      </el-table-column>
      <el-table-column label="商品状态" align="center" prop="state">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.shop_commodity_state" :value="scope.row.state"/>
        </template>
      </el-table-column>
      <el-table-column label="拓展" align="center" prop="extend"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['shop:commodity:edit']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['shop:commodity:remove']"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改商品对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="商品名" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名"/>
        </el-form-item>
        <el-form-item label="商品价格" prop="price">
          <el-input v-model="form.price" placeholder="请输入商品价格"/>
        </el-form-item>
        <el-form-item label="商品库存" prop="stock">
          <el-input v-model="form.stock" placeholder="请输入商品库存"/>
        </el-form-item>
        <el-form-item label="商品内容" prop="content">
          <el-input v-model="form.content" type="textarea" placeholder="请输入内容"/>
        </el-form-item>
        <el-form-item label="商品主图" prop="coverImage">
          <div>{{ form.coverImage }}</div>
          <image-upload v-model="form.coverImage"/>
        </el-form-item>
        <el-form-item label="商品轮播图" prop="viewImage">
          <div>{{ form.viewImage }}</div>
          <image-upload v-model="form.viewImage"/>
        </el-form-item>
        <el-form-item label="商品详细图" prop="detailImage">
          <div>{{ form.detailImage }}</div>
          <image-upload v-model="form.detailImage"/>
        </el-form-item>
        <el-form-item label="商品选项" prop="opt">
<!--          <el-input v-model="form.opt" type="textarea" placeholder="请输入内容"/>-->
        </el-form-item>
        <el-form-item label="商品状态" prop="state">
          <el-select v-model="form.state" placeholder="请选择商品状态">
            <el-option
              v-for="dict in dict.type.shop_commodity_state"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="拓展" prop="extend">
          <el-input v-model="form.extend" placeholder="请输入拓展"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listCommodity, getCommodity, delCommodity, addCommodity, updateCommodity } from '@/api/shop/commodity'
import { cleanLogininfor } from '@/api/monitor/logininfor'

export default {
  name: 'Commodity',
  dicts: ['shop_commodity_state'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 商品表格数据
      commodityList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        price: null,
        stock: null,
        content: null,
        coverImage: null,
        viewImage: null,
        detailImage: null,
        state: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
      optMap: [],
      optLable: [],
      optItem: {
        text: '',
        adjustPrice: 0
      }

    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询商品列表 */
    getList() {
      this.loading = true
      listCommodity(this.queryParams).then(response => {
        let tmpList = response.rows
        // this.commodityList = response.rows
        for (let responseKey in  tmpList) {
          // console.log(responseKey, tmpList[responseKey].viewImage)
          tmpList[responseKey].viewImage = this.arrayToStr(tmpList[responseKey].viewImage)
          // console.log(responseKey, tmpList[responseKey].viewImage)
          tmpList[responseKey].detailImage = this.arrayToStr(tmpList[responseKey].detailImage)
        }
        this.commodityList = tmpList
        // console.log(this.commodityList)
        this.total = response.total
        this.loading = false
      })

    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        name: null,
        price: null,
        stock: null,
        content: null,
        coverImage: null,
        viewImage: null,
        detailImage: null,
        opt: null,
        state: null,
        extend: null,
        createTime: null
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加商品'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getCommodity(id).then(response => {
        this.form = response.data
        this.form.viewImage = this.arrayToStr(this.form.viewImage)
        this.form.detailImage = this.arrayToStr(this.form.detailImage)

        this.open = true
        this.title = '修改商品'
      })
    },
    /** 提交按钮 */
    submitForm() {
      // this.$refs['form'].validate(valid => {
      //   if (valid) {
      //
      //     this.form.viewImage = this.parseImage(this.form.viewImage)
      //     this.form.detailImage = this.parseImage(this.form.detailImage)
      //
      //     if (this.form.id != null) {
      //       updateCommodity(this.form).then(response => {
      //         this.$modal.msgSuccess('修改成功')
      //         this.open = false
      //         this.getList()
      //       })
      //     } else {
      //       addCommodity(this.form).then(response => {
      //         this.$modal.msgSuccess('新增成功')
      //         this.open = false
      //         this.getList()
      //       })
      //     }
      //
      //
      //   }
      // })
      this.form.viewImage = this.parseImage(this.form.viewImage)
      this.form.detailImage = this.parseImage(this.form.detailImage)

      if (this.form.id != null) {
        updateCommodity(this.form).then(response => {
          this.$modal.msgSuccess('修改成功')
          this.open = false
          this.getList()
        })
      } else {
        addCommodity(this.form).then(response => {
          this.$modal.msgSuccess('新增成功')
          this.open = false
          this.getList()
        })
      }
    },
    parseImage(image) {
      // if (image === '') {
      //   return ''
      // }
      // // console.log("image",image)
      // let isValid = false
      // try {
      //   let arr = JSON.parse(image)
      //   isValid = Array.isArray(arr)
      // } catch (error) {
      //   // do nothing
      // }
      // return isValid ? image : JSON.stringify(image.split(','))

      // if (image === '') {
      //   return ''
      // }
      // var arr = image.split(","); // 分割字符串为数组
      // var json_str = JSON.stringify(arr);
      // return json_str

      return  image.split(",")

    },
    arrayToStr(arr) {
      if (arr===null){
        return ""
      }
      let newStr = arr.join(",")
      // 返回结果
      return newStr;
    },
    traverseOpt(obj, indent) { // 定义一个递归函数，参数为对象和缩进
      var str = '' // 初始化一个空字符串
      for (var key in obj) { // 遍历对象的每个属性
        var value = obj[key] // 获取属性对应的值
        if (typeof value === 'object') { // 如果值是一个对象，说明有嵌套
          str += indent + key + ': \n' // 拼接属性名和换行符
          str += this.traverseOpt(value, indent + '\t') // 递归调用函数，缩进增加一个制表符
        } else { // 如果值不是一个对象，说明没有嵌套
          str += indent + key + ': ' + value + '\n' // 拼接属性名和值，用换行符分隔
        }
      }
      return str = str !== '' ? str : '没有选项' // 返回拼接好的字符串
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认删除商品编号为"' + ids + '"的数据项？').then(function() {
        return delCommodity(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {
      })
    }
    ,
    /** 导出按钮操作 */
    handleExport() {
      this.download('shop/commodity/export', {
        ...this.queryParams
      }, `commodity_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>
