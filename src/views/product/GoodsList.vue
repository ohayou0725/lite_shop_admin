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
    <a-spin :spinning="loading">
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
          <a-tooltip>
            <template slot="title">点击查看商品详情</template>
            <a style="font-size:2px" @click="clickGetDetail(record.id)">{{text}}</a>
          </a-tooltip>
        </template>
        <template slot="titleImg" slot-scope="text,record">
          <img :src="text" width="80px" />
        </template>
        <template slot="brand" slot-scope="text,record">
          <img :src="text" width="40px" />
        </template>
        <template slot="status" slot-scope="text,record">
          <!-- <a-switch
            checked-children="在售"
            un-checked-children="未上架"
            :checked="text == 1"
            @click="changeStatus(record)"
          ></a-switch>-->
          <a-tag v-if="text==1" color="#2db7f5">在售</a-tag>
          <a-tag v-if="text==0" color="#f50">未上架</a-tag>
        </template>
        <template slot="tag" slot-scope="text,record">
          <a-tag v-if="record.isNew == 1" color="green">新品</a-tag>
          <a-tag v-if="record.hot == 1" color="red">热卖</a-tag>
        </template>
        <template slot="reservePrice" slot-scope="text,record">￥{{text}}</template>
        <template slot="sales" slot-scope="text,record">{{text}}{{record.unit}}</template>
        <template slot="stock" slot-scope="text,record">{{text}}{{record.unit}}</template>
        <span slot="action" slot-scope="text, record">
          <template>
            <a-dropdown>
              <a-menu slot="overlay">
                <a-menu-item>
                  <a @click="editBasicInfo(record)">基本信息</a>
                </a-menu-item>
                <a-menu-item>
                  <a @click="editAttrInfo(record)">属性信息</a>
                </a-menu-item>
                <a-menu-item>
                  <a @click="editSpecInfo(record)">规格信息</a>
                </a-menu-item>
              </a-menu>
              <a>
                编辑
                <a-icon type="down" />
              </a>
            </a-dropdown>
            <a-divider type="vertical" />
            <a @click="clickDelete(record)">删除</a>
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
      <div>
        <a-spin :spinning="isLoading">
          <template>
            <a-descriptions :title="goodsDetailTitle">
              <a-descriptions-item label="商品简要" span="2">{{goodsDetail.brief}}</a-descriptions-item>
              <a-descriptions-item label="商品标题" span="2">{{goodsDetail.title}}</a-descriptions-item>
              <a-descriptions-item label="商品分类" span="2">{{goodsDetail.category}}</a-descriptions-item>
              <a-descriptions-item label="商品重量" span="2">￥{{goodsDetail.weight}}kg</a-descriptions-item>
              <a-descriptions-item label="起步价格" span="2">￥{{goodsDetail.price}}元起</a-descriptions-item>
              <a-descriptions-item label="折扣价格" span="2">￥{{goodsDetail.discountPrice}}元</a-descriptions-item>
              <a-descriptions-item label="轮播图片" span="4">
              </a-descriptions-item>
            </a-descriptions>
            <a-list
                    :grid="{ gutter: 32, xs: 1, sm: 2, md: 4, lg: 4, xl: 6, xxl: 3 }"
                    :data-source="goodsDetail.galleryList"
                  >
                    <a-list-item slot="renderItem" slot-scope="item, index">
                      <a-card :bordered="false">
                        <img slot="cover" :src="item" style="width:120px " />
                      </a-card>
                    </a-list-item>
                  </a-list>
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
          <a-card style="margin-top : 20px" :bordered="false">
            <a-button
              type="primary"
              slot="extra"
              @click="()=>this.openEditor=true"
              v-if="!openEditor"
            >编辑详情页</a-button>
            <a-button type="primary" slot="extra" @click="editDetail" v-if="openEditor">确定</a-button>
            <a-button
              type="danger"
              slot="extra"
              @click="()=>{this.openEditor=false;this.detail = this.oldDetail}"
              v-if="openEditor"
              style="margin-left:8px"
            >取消</a-button>
            <template v-if="!openEditor">
              <div v-html="goodsDetail.detail"></div>
            </template>
            <template v-else>
              <WangEditor ref="editor" v-model="detail"></WangEditor>
            </template>
          </a-card>
        </a-spin>
      </div>
    </a-modal>

    <a-drawer
      :title="drawerTitle"
      :width="720"
      :visible="drawerVisible"
      :body-style="{ paddingBottom: '80px' }"
      @close="onClose"
    >
      <div v-if="editBasic">
        <EditGoodsBasic :goodsInfo="goodsBasicInfo" @close="(flag)=>editFormClose(flag)"></EditGoodsBasic>
      </div>
      <div v-else-if="editAttr">
        <a-table
          :columns="editAttrColumns"
          :pagination="false"
          :data-source="attrList"
          size="small"
        >
          <template slot="value" scope="text,record">
            <a-input
              v-if="record.editable"
              style="width:120px"
              v-model="record.value"
              @blur="closeInput(record)"
            />
            <template v-else>{{ text }}</template>
          </template>

          <template slot="action" scope="text,record">
            <a-button type="link" size="small" shape="round" @click="attrEditable(record)">编辑</a-button>
          </template>
        </a-table>
        <div style="text-align:center; margin-top:20px">
          <a-button type="primary" @click="submitEditAttr">提交</a-button>
          <a-button style="margin-left: 8px" @click="()=>this.onClose()">取消</a-button>
        </div>
      </div>
      <div v-else>
        <a-table :pagination="false" :data-source="specList" size="small">
          <a-table-column-group>
            <a-table-column data-index="spec" title="规格名" align="center" key="1">
              <template slot-scope="text,record">
                <a-input style="width:120px" v-model="text.name" />
              </template>
            </a-table-column>
            <a-table-column data-index="spec" title="排序号" align="center" key="2">
              <template slot-scope="text,record">
                <a-input-number style="width:120px" v-model="text.sort" />
              </template>
            </a-table-column>
          </a-table-column-group>
          <div slot="expandedRowRender" slot-scope="record">
            <!-- <template v-if="!record.isEdit">
              <a-tag
                v-for="(item,index) in record.values"
                :key="index"
                color="blue"
                :closable="record.values.length > 1"
              @close="removeTag(record,item.specValue)"
              >{{item.specValue}}</a-tag>
            </template>-->
            <template v-if="!record.isEdit">
              <a-radio-group
                button-style="solid"
                style="margin-right:20px"
                v-model="record.selectValue"
                @change="(e)=>select(e,record)"
              >
                <a-radio-button
                  v-for="(item,index) in record.values"
                  :key="index"
                  :value="item.specValue"
                >{{item.specValue}}</a-radio-button>
              </a-radio-group>
            </template>

            <template v-else>
              <a-input
                v-for="(item,index) in record.values"
                :key="index"
                v-model="item.specValue"
                :disabled="item.disabled"
                style="width: 70px;height:24px;margin-right:5px"
              />
            </template>
            <template></template>
            <a-input
              v-if="record.isAdd"
              v-model="specValueInput"
              style="width: 70px;height:24px;margin-right:20px"
              @blur="addSpecValue(record)"
            />
            <template v-if="!record.isEdit">
              <a-button
                icon="edit"
                size="small"
                type="primary"
                style="margin-left='20px"
                @click="openSpecEdit(record)"
                :disabled="record.selectValue == '' "
              >编辑</a-button>
              <a-button
                icon="plus"
                size="small"
                style="margin-left='20px"
                @click="openSpecValue(record)"
              >添加</a-button>
              <a-popconfirm
                title="是否删除该规格值"
                ok-text="确定"
                cancel-text="取消"
                @confirm="(e)=>confimDelete(e,record)"
              >
                <a-button
                  type="danger"
                  icon="delete"
                  size="small"
                  style="margin-left='20px"
                  :disabled="record.selectValue == '' || record.values.length < 2"
                >删除</a-button>
              </a-popconfirm>
            </template>
            <template v-else>
              <a-button
                type="link"
                size="small"
                style="margin-left=20px"
                @click="submitEditSpecValue(record)"
              >确定</a-button>
              <a-button
                type="link"
                size="small"
                style="margin-left=20px"
                @click="cancelEditSpecValue(record)"
              >取消</a-button>
            </template>
          </div>
        </a-table>
        <div style="text-align:center; margin-top:20px">
          <a-button type="primary" @click="submitEditSpec">提交</a-button>
          <a-button style="margin-left: 8px" @click="()=>this.onClose()">取消</a-button>
        </div>
      </div>
    </a-drawer>
  </div>
</template>


<script>
import { getTree } from '@/api/category'
import {
  getSpuList,
  getSpuDetail,
  changeStatus,
  editDetail,
  editAttr,
  getSpecs,
  editSpec,
  deleteGoods,
} from '@/api/goods'
import WangEditor from '../../components/Editor/WangEditor'
import EditGoodsBasic from '../product/EditGoodsBasic'
import { notification } from 'ant-design-vue'
import { length } from 'store/storages/all'
export default {
  name: 'goods',
  components: { WangEditor, EditGoodsBasic },
  data() {
    return {
      advanced: false,
      hotOrNew: '',
      queryParam: {},
      category: [],
      options: [],
      spuList: [],
      attrList: [],
      specList: [],
      cacheSpecList: null,
      visible: false,
      goodsDetail: {},
      goodsDetailTitle: '',
      column: 2,
      specListColumn: [],
      isLoading: false,
      loading: false,
      openEditor: false,
      detail: {},
      oldDetail: {},
      specValueInput: '',
      scroll: {
        x: 1200,
      },
      categoryField: {
        label: 'name',
        value: 'id',
        children: 'children',
      },
      drawerVisible: false,
      editBasic: false,
      editAttr: false,
      editSpec: false,
      goodsBasicInfo: {},
      goodsForm: {},
      columns: [
        {
          title: '序号',
          align: 'center',
          width: '3%',
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
          scopeSlots: { customRender: 'reservePrice' },
        },
        {
          title: '销量',
          align: 'center',
          dataIndex: 'sales',
          scopedSlots: { customRender: 'sales' },
        },
        {
          title: '库存',
          align: 'center',
          dataIndex: 'stock',
          scopedSlots: { customRender: 'stock' },
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          width: '15%',
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
      editAttrColumns: [
        {
          title: '属性名',
          dataIndex: 'attr',
          align: 'center',
        },
        {
          title: '属性值',
          dataIndex: 'value',
          align: 'center',
          scopedSlots: { customRender: 'value' },
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          scopedSlots: { customRender: 'action' },
        },
      ],
      editSpecColumns: [
        {
          title: '规格名',
          dataIndex: 'name',
          align: 'center',
          scopedSlots: { customRender: 'spec.name' },
        },
        {
          title: '排序号',
          dataIndex: 'sort',
          align: 'center',
          scopedSlots: { customRender: 'spec.sort' },
        },
        // {
        //   title: '操作',
        //   dataIndex: 'op',
        //   align: 'center',
        //   scopedSlots: { customRender: 'op' },
        // },
      ],
      valueColumns: [
        { title: '属性值', dataIndex: 'specValue' },
        { title: '操作', dataIndex: 'operation', scopedSlots: { customRender: 'operation' } },
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
  computed: {
    drawerTitle: function () {
      if (this.editBasic) {
        return '编辑商品基本信息'
      } else if (this.editAttr) {
        return '编辑商品属性信息'
      } else {
        return '编辑商品规格信息'
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
      this.queryParam.categoryIds = value[value.length - 1]
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
          this.detail = this.goodsDetail.detail
          this.oldDetail = this.goodsDetail.detail
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
    openEd() {
      this.openEditor = true
    },
    clickDelete(record) {
      const that = this
      this.$confirm({
        title: '确认删除',
        content: '删除该商品后将无法恢复,是否删除?',
        onOk() {
          deleteGoods(record.id).then((res) => {
            if (res.success) {
              notification.success({
                message: '成功',
                description: '删除商品成功',
              })
              that.queryGoodsSpu({})
            } else {
              notification.error({
                message: '失败',
                description: res.msg,
              })
            }
          })
        },
      })
    },
    editDetail() {
      editDetail({ id: this.goodsDetail.id, detail: this.detail }).then((res) => {
        if (res.success) {
          notification.success({
            message: '成功',
            description: '商品详情页修改成功',
          })
          this.openEditor = false
          this.goodsDetail.detail = this.detail
          this.oldDetail = this.detail
        } else {
          notification.error({
            message: '失败',
            description: '商品详情页修改失败',
          })
        }
      })
    },

    attrEditable(record) {
      const newAttr = [...this.attrList]
      newAttr.forEach((item) => {
        if (item.attrId == record.attrId) {
          item.editable = true
        }
      })
      this.attrList = newAttr
    },

    submitEditAttr() {
      this.goodsForm.attrValues = this.attrList
      editAttr(this.goodsForm).then((res) => {
        if (res.success) {
          notification.success({
            message: '成功',
            description: '修改商品属性成功',
          })
          ;(this.goodsForm = {}), this.onClose()
        } else {
          notification.error({
            message: '失败',
            description: res.msg,
          })
        }
      })
    },
    submitEditSpec() {
      const arr = this.specList.filter((item) => item.sort === null || item.name == '')
      if (arr.length > 0) {
        notification.error({
          message: '错误',
          description: '还有未输入项',
        })
        return
      }
      this.goodsForm.specs = this.specList
      editSpec(this.goodsForm).then((res) => {
        if (res.success) {
          notification.success({
            message: '成功',
            description: '修改商品规格成功',
          })
          this.onClose()
        } else {
          this.specList = JSON.parse(this.cacheSpecList)
          this.$forceUpdate()
          notification.error({
            message: '错误',
            description: res.msg,
          })
        }
      })
    },
    closeInput(record) {
      if (typeof record.id != 'undefined') {
        const newData = [...this.specList]
        newData.forEach((item) => (item.editable = false))
        this.specList = newData
      } else {
        const newData = [...this.attrList]
        newData.forEach((item) => (item.editable = false))
        this.attrList = newData
      }
    },
    editAttrInfo(record) {
      this.editAttr = true
      this.editSpec = false
      this.editBasic = false
      this.drawerVisible = true
      getSpuDetail(record.id).then((res) => {
        if (res.success) {
          this.goodsForm.id = record.id
          this.attrList = res.data.detail.attrValueList
          this.attrList.forEach((attr) => {
            attr.editable = false
          })
        } else {
          notification.error({
            message: '失败',
            description: res.msg,
          })
        }
      })
    },
    editSpecInfo(record) {
      this.editAttr = false
      this.editSpec = true
      this.editBasic = false
      this.drawerVisible = true
      getSpecs(record.id).then((res) => {
        if (res.success) {
          this.goodsForm.id = record.id
          this.specList = res.data.list
          if (this.specList === null) {
            return
          }
          this.specList.forEach((spec) => {
            spec.editable = false
            spec.isAdd = false
            spec.isEdit = false
            spec.selectValue = ''
          })
          this.cacheSpecList = JSON.stringify(this.specList)
        } else {
          notification.error({
            message: '失败',
            description: res.msg,
          })
        }
      })
    },
    openSpecValue(record) {
      let oldData = this.specList
      let spec = oldData.filter((item) => {
        return item.spec.id === record.spec.id
      })[0]
      spec.isAdd = true
      this.specList = oldData
      this.$forceUpdate()
    },
    addSpecValue(record) {
      let spec = this.specList.filter((item) => {
        return item.spec.id === record.spec.id
      })[0]
      const exist =
        spec.values.filter((item) => {
          return item.specValue === this.specValueInput.trim()
        }).length > 0
      if (this.specValueInput === '' || exist) {
        spec.isAdd = false
        this.$forceUpdate()
        return
      } else {
        spec.values.push({ specId: spec.spec.id, specValue: this.specValueInput })
        spec.isAdd = false
        this.specValueInput = ''
      }
    },
    openSpecEdit(record) {
      this.cacheSpecList = JSON.stringify(this.specList)
      let oldData = this.specList
      let spec = oldData.filter((item) => {
        return item.spec.id === record.spec.id
      })[0]
      spec.isEdit = true
      spec.values.forEach((item) => {
        if (item.specValue === record.selectValue) {
          item.disabled = false
        } else {
          item.disabled = true
        }
      })
      this.specList = oldData
      this.$forceUpdate()
    },
    submitEditSpecValue(record) {
      let oldData = this.specList
      let spec = oldData.filter((item) => {
        return item.spec.id === record.spec.id
      })[0]
      let empty = spec.values.filter((item) => {
        return item.specValue == ''
      })
      let arr = []
      spec.values.forEach((item) => {
        arr.push(item.specValue)
      })
      if (empty.length > 0 || this.isRepeat(arr)) {
        return
      } else {
        spec.selectValue = ''
        spec.isEdit = false
        this.specList = oldData
        this.$forceUpdate()
      }

      // let obj = {}
      // let arr = spec.values.reduce(function (item, next) {
      //   obj[next.specValue] ? '' : (obj[next.specValue] = true && item.push(next))
      //   return item
      // }, [])
      // spec.values = arr
    },
    cancelEditSpecValue(record) {
      let spec = this.specList.filter((item) => {
        return item.spec.id === record.spec.id
      })[0]
      spec.isEdit = false
      this.specList = JSON.parse(this.cacheSpecList)
      this.$forceUpdate()
    },
    select(e, record) {
      const value = e.target.value
      let spec = this.specList.filter((item) => {
        return item.spec.id === record.spec.id
      })[0]
      spec.selectValue = value
      this.$forceUpdate()
    },
    deleteValue(record) {
      if (record.values.length < 2) {
        return
      }
      let newData = []
      record.values.forEach((item) => {
        if (record.selectValue !== item.specValue) {
          newData.push(item)
        }
      })
      record.values = newData
      record.selectValue = ''
      this.$forceUpdate()
    },
    confimDelete(e, record) {
      if (record.values.length < 2) {
        return
      }
      let newData = []
      record.values.forEach((item) => {
        if (record.selectValue !== item.specValue) {
          newData.push(item)
        }
      })
      record.values = newData
      record.selectValue = ''
      this.$forceUpdate()
    },
    removeTag(spec, value) {
      let newSpec = spec.values.filter((item) => {
        return item.specValue !== value
      })
      let newData = this.specList
      newData.forEach((item) => {
        if (item.spec.id == spec.spec.id) {
          item.values = newSpec
        }
      })
      this.specList = newData
      this.$forceUpdate()
    },
    changeStatus(goods) {
      changeStatus({
        id: goods.id,
        status: 1 - goods.status,
      }).then((res) => {
        if (res.success) {
          if (goods.status == 0) {
            this.$message.success('商品已上架')
          } else {
            this.$message.success('商品已下架')
          }
          goods.status = 1 - goods.status
        } else {
          notification.error({
            message: '失败',
            description: res.msg,
          })
        }
      })
    },
    editBasicInfo(record) {
      this.editBasic = true
      this.editAttr = false
      this.editSpec = false
      this.drawerVisible = true
      this.goodsBasicInfo = record
    },
    editFormClose(flag) {
      if (flag) {
        this.queryGoodsSpu(this.queryParam)
      }
      this.onClose()
    },
    onClose() {
      ;(this.drawerVisible = false), (this.editBasic = false), (this.editAttr = false), (this.editSpec = false)
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
        title: '销量',
        key: '销量',
        dataIndex: 'sales',
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
    getImg(i) {
      return this.goodsDetail.galleryList[i]
    },
    isRepeat(arr) {
      var hash = {}
      for (var i in arr) {
        if (hash[arr[i]]) {
          return true
        }
        hash[arr[i]] = true
      }
      return false
    },
  },
}
</script>

<style scoped>

</style>