<template>
  <div>
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="商品编号">
              <a-input v-model="queryParam.goodsSn" placeholder="输入商品编号" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="商品名">
              <a-input v-model="queryParam.name" placeholder="输入包含的商品名" />
            </a-form-item>
          </a-col>
          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="商品品牌">
                <a-input v-model="queryParam.brand" placeholder="输入商品品牌名" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="商品分类">
                <a-cascader
                  :fieldNames="categoryField"
                  :options="options"
                  change-on-select
                  placeholder="选择一个分类"
                  @change="cascaderChange"
                  v-model="category"
                />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="商品状态">
                <a-select
                  v-model="queryParam.status"
                  placeholder="请选择"
                  default-value="1"
                  allowClear
                >
                  <a-select-option value="0">未上架</a-select-option>
                  <a-select-option value="1">在售</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="商品筛选">
                <a-select placeholder="请选择" default-value="0" @change="isNewOrHot">
                  <a-select-option value="0">全部</a-select-option>
                  <a-select-option value="1">热卖</a-select-option>
                  <a-select-option value="2">新品</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </template>
          <a-col :md="!advanced && 8 || 24" :sm="24">
            <span
              class="table-page-search-submitButtons"
              :style="advanced && { float: 'right', overflow: 'hidden' } || {} "
            >
              <a-button type="primary" @click="queryGoodsSpu(queryParam)">查询</a-button>
              <a-button style="margin-left: 8px" @click="reset()">重置</a-button>
              <a @click="advanced =! advanced" style="margin-left: 8px">
                {{ advanced ? '收起' : '展开' }}
                <a-icon :type="advanced ? 'up' : 'down'" />
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <a-spin :spinning='loading'>
    <a-table
      bordered
      :data-source="spuList"
      :loading="loading"
      :columns="columns"
       rowKey="{record=>record.id}"
      :pagination="pagination"
      :scroll="scroll"
    >
      <template slot="name" slot-scope="text,record">
        <a style="font-size:2px" @click="clickGetDetail(record.id)">{{text}}</a>
      </template>
      <template slot="titleImg" slot-scope="text,record">
        <img :src="text" width="80px" />
      </template>
      <template slot="brand" slot-scope="text,record">
        <img :src="text" width="40px" />
      </template>
      <template slot="status" slot-scope="text,record">
        <a-tag v-if="text == 1" color="blue">在售</a-tag>
        <a-tag v-else color="red">未上架</a-tag>
      </template>
      <template slot="tag" slot-scope="text,record">
        <a-tag v-if="record.isNew == 1" color="green">新品</a-tag>
        <a-tag v-if="record.hot == 1" color="red">热卖</a-tag>
      </template>
      <span slot="action" slot-scope="text, record">
        <template>
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="handleSub(record)">删除</a>
        </template>
      </span>
    </a-table>
    </a-spin>
    <a-modal
      title="商品详情"
      :visible="visible"
      :footer="null"
      @cancel="()=>this.visible = false"
      :afterClose="()=>{this.specListColumn=[] ;this.goodsDetail={}}"
      :width="900"
    >
      <a-spin :spinning="isLoading">
        <template>
          <a-descriptions :title="goodsDetailTitle">
            <a-descriptions-item label="商品简要" span="2">{{goodsDetail.brief}}</a-descriptions-item>
            <a-descriptions-item label="商品分类" span="2">{{goodsDetail.category}}</a-descriptions-item>
            <a-descriptions-item label="价格" span="2">{{goodsDetail.price}}元</a-descriptions-item>
            <a-descriptions-item label="折扣价格" span="2">{{goodsDetail.discountPrice}}</a-descriptions-item>
            <a-descriptions-item label="轮播图片" span="4">
              <div style>
                <a-row :gutter="16">
                  <a-col :span="8" v-for="(item,key) in goodsDetail.galleryList" :key="key">
                    <a-card :bordered="false">
                      <img slot="cover" :src="item" style="width:120px " />
                    </a-card>
                  </a-col>
                </a-row>
              </div>
            </a-descriptions-item>
          </a-descriptions>
        </template>
        <a-divider type="horizontal" />
        <template>
          <div>
            <a-tabs default-active-key="1">
              <a-tab-pane key="1" tab="商品属性">
                <a-table
                  size="small"
                  :dataSource="goodsDetail.attrValueList"
                  :pagination="false"
                  :columns="attrColumns"
                ></a-table>
              </a-tab-pane>
              <a-tab-pane key="2" tab="商品规格" force-render>
                <a-table
                  size="small"
                  bordered
                  :dataSource="goodsDetail.goodsSpecList"
                  :pagination="false"
                  :columns="specListColumn"
                >
                  <template slot="img" slot-scope="text,record">
                    <img :src="text" style="width:60px;height:60px" />
                  </template>
                </a-table>
              </a-tab-pane>
            </a-tabs>
          </div>
        </template>
      </a-spin>
    </a-modal>
  </div>
</template>


<script>
import { getTree } from '@/api/category'
import { getSpuList, getSpuDetail } from '@/api/goods'
import WangEditor from '../../components/Editor/WangEditor'
import { notification } from 'ant-design-vue'
export default {
  name: 'goods',
  components: { WangEditor },
  data() {
    return {
      advanced: false,
      hotOrNew: '',
      queryParam: {},
      category: [],
      options: [],
      spuList: [],
      visible: false,
      goodsDetail: {},
      goodsDetailTitle: '',
      column: 2,
      specListColumn: [],
      isLoading: false,
      loading : false,
      scroll: {
        x: 1200,
        y: 600,
      },
      categoryField: {
        label: 'name',
        value: 'id',
        children: 'children',
      },
      columns: [
        {
          title: '序号',
          align: 'center',
          width: '5%',
          customRender: (value, row, index) => {
            return `${(this.pagination.defaultCurrent - 1) * this.pagination.defaultPageSize + index + 1}`
          },
        },
        {
          title: '商品编号',
          align: 'center',
          dataIndex: 'goodsSn',
        },
        {
          title: '商品名',
          align: 'center',
          dataIndex: 'name',
          scopedSlots: { customRender: 'name' },
        },
        {
          title: '商品图片',
          align: 'center',
          dataIndex: 'titleImg',
          scopedSlots: { customRender: 'titleImg' },
        },
        {
          title: '品牌商',
          align: 'center',
          dataIndex: 'brandLogo',
          scopedSlots: { customRender: 'brand' },
        },
        {
          title: '状态',
          align: 'center',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
        },
        {
          title: '标签',
          align: 'center',
          dataIndex: 'tag',
          scopedSlots: { customRender: 'tag' },
        },
        {
          title: '最低价格',
          align: 'center',
          dataIndex: 'reservePrice',
        },
        {
          title: '销量',
          align: 'center',
          dataIndex: 'sales',
        },
        {
          title: '库存',
          align: 'center',
          dataIndex: 'stock',
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
        //   fixed: 'right',
          scopedSlots: { customRender: 'action' },
        },
      ],
      attrColumns: [
        {
          title: '属性名',
          dataIndex: 'attr',
          align: 'center',
        },
        {
          title: '属性值',
          dataIndex: 'value',
          align: 'center',
        },
      ],

      pagination: {
        defaultCurrent: 1,
        defaultPageSize: 10,
        total: 0,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '30'],
        showTotal: (total) => `共${total}条记录`,
        onShowSizeChange: (current, pageSize) => {
          this.pagination.defaultCurrent = 1
          this.pagination.defaultPageSize = pageSize
          this.queryParam.page = this.pagination.defaultCurrent
          this.queryParam.size = this.pagination.defaultPageSize
          this.queryGoodsSpu(this.queryParam)
        },
        onChange: (current, size) => {
          this.pagination.defaultCurrent = current
          this.pagination.defaultPageSize = size
          this.queryParam.page = this.pagination.defaultCurrent
          this.queryParam.size = this.pagination.defaultPageSize
          this.queryGoodsSpu(this.queryParam)
        },
      },
    }
  },
  mounted() {
    this.queryGoodsSpu(this.queryParam)
  },

  computed: {},
  watch: {
    advanced(val) {
      if (val === true) {
        this.getCateTree()
      }
    },
  },
  methods: {
    reset() {
      ;(this.queryParam = {}), (this.category = [])
    },
    cascaderChange(value, selected) {
      if (value.length === 0) {
        return
      }
      this.queryParam.categoryId = value[value.length - 1]
    },
    isNewOrHot(value) {
      this.queryParam.hot = null
      this.queryParam.isNew = null
      if (value == 1) {
        this.queryParam.hot = 1
      } else if (value == 2) {
        this.queryParam.isNew = 1
      }
    },
    queryGoodsSpu(param) {
      this.loading = true
      getSpuList(param).then((res) => {
        if (res.success) {
          this.spuList = res.data.list.list
        } else {
          notification.error({
            message: '错误',
            description: res.msg,
          })
        }
         this.loading = false

      })
    },
    getCateTree() {
      getTree().then((res) => {
        if (res.success) {
          this.options = res.data.tree
        } else {
          notification.error({
            message: '错误',
            description: res.msg,
          })
        }
      })
    },
    clickGetDetail(id) {
      this.visible = true
      this.getDetail(id)
    },
    getDetail(id) {
      this.isLoading = true
      getSpuDetail(id).then((res) => {
        if (res.success) {
          this.goodsDetail = res.data.detail
          this.goodsDetailTitle = `商品编号: ${this.goodsDetail.goodsSn}`
          if (this.goodsDetail.goodsSpecList !== null) {
             this.getTitle(this.goodsDetail.goodsSpecList[0].specAndValueList)
          }
        } else {
          notification.error({
            message: '错误',
            description: res.msg,
          })
        }
       this.isLoading = false
      })
    },
    getTitle(specList) {
      let index = 0
      specList.forEach((spec) => {
        let specTitle = {}
        specTitle.title = spec.spec
        specTitle.key = spec.spec
        specTitle.dataIndex = `specAndValueList[${index}].value`
        specTitle.align = 'center'
        this.specListColumn.push(specTitle)
        index++
      })
      this.specListColumn.push({
        title: '图片',
        key: '图片',
        dataIndex: 'img',
        align: 'center',
        scopedSlots: { customRender: 'img' },
      })
      this.specListColumn.push({
        title: '价格',
        key: '价格',
        dataIndex: 'price',
        align: 'center',
      })
      this.specListColumn.push({
        title: '库存',
        key: '库存',
        dataIndex: 'stock',
        align: 'center',
      })
      this.specListColumn.push({
        title: '预警库存',
        key: '预警库存',
        dataIndex: 'stockWarningCount',
        align: 'center',
      })
    },
  },
}
</script>

<style scoped>
</style>