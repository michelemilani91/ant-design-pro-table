import React, { useState, useEffect } from 'react';
import { FormItemProps, FormProps } from 'antd/es/form';
import { Input, Row, Col, TimePicker, InputNumber, DatePicker, Select } from 'antd';
import moment, { Moment } from 'moment';
import RcResizeObserver from 'rc-resize-observer';
import useMediaQuery from 'use-media-antd-query';
import useMergeValue from 'use-merge-value';
import { ConfigConsumer, ConfigConsumerProps } from 'antd/lib/config-provider';
import { DownOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { FormComponentProps } from '@ant-design/compatible/lib/form/Form';

import {
  parsingValueEnumToArray,
  useDeepCompareEffect,
  genColumnKey,
  ObjToMap,
} from '../component/util';
import { useIntl, IntlType } from '../component/intlContext';
import Container from '../container';
import { ProColumnsValueTypeFunction } from '../defaultRender';
import { ProTableTypes } from '../Table';
import { ProColumns, ProColumnsValueType } from '../index';
import FormOption, { FormOptionProps } from './FormOption';
import './index.less';

/**
 * 默认的查询表单配置
 */
const defaultColConfig = {
  xs: 24,
  sm: 24,
  md: 12,
  lg: 12,
  xl: 8,
  xxl: 6,
};

/**
 * 默认的新建表单配置
 */
const defaultFormColConfig = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 24,
  xl: 24,
  xxl: 24,
};

/**
 * 用于配置操作栏
 */
export interface SearchConfig {
  /**
   * 查询按钮的文本
   */
  searchText?: string;
  /**
   * 重置按钮的文本
   */
  resetText?: string;
  span?: number | typeof defaultColConfig;
  /**
   * 收起按钮的 render
   */
  collapseRender?: (
    collapsed: boolean,
    /**
     * 是否应该展示，有两种情况
     * 列只有三列，不需要收起
     * form 模式 不需要收起
     */
    showCollapseButton?: boolean,
  ) => React.ReactNode;
  /**
   * 底部操作栏的 render
   * searchConfig 基础的配置
   * props 更加详细的配置
   * {
      type?: 'form' | 'list' | 'table' | 'cardList' | undefined;
      form: FormInstance;
      submit: () => void;
      collapse: boolean;
      setCollapse: (collapse: boolean) => void;
      showCollapseButton: boolean;
   * }
   */
  optionRender?:
    | ((
        searchConfig: Omit<SearchConfig, 'optionRender'>,
        props: Omit<FormOptionProps, 'searchConfig'>,
      ) => React.ReactNode)
    | false;
  /**
   * 是否收起
   */
  collapsed?: boolean;
  /**
   * 收起按钮的事件
   */
  onCollapse?: (collapsed: boolean) => void;
  /**
   * 提交按钮的文本
   */
  submitText?: string;
}

/**
 * 获取最后一行的 offset，保证在最后一列
 * @param length
 * @param span
 */
const getOffset = (length: number, span: number = 8) => {
  const cols = 24 / span;
  return (cols - 1 - (length % cols)) * span;
};

/**
 * 默认的设置
 */
const defaultSearch: SearchConfig = {
  searchText: '查询',
  resetText: '重置',
  span: defaultColConfig,
  collapseRender: (collapsed: boolean) => (collapsed ? '展开' : '收起'),
};

export interface TableFormItem<T> extends Omit<FormItemProps, 'children'> {
  onSubmit?: (value: T) => void;
  onReset?: () => void;
  formConfig?: Omit<FormProps, 'form'>;
  type?: ProTableTypes;
  form: FormComponentProps['form'];
  dateFormatter?: 'string' | 'number' | false;
  search?: boolean | SearchConfig;
  formRef?:
    | React.MutableRefObject<(FormComponentProps['form'] & { submit: () => void }) | undefined>
    | ((actionRef: FormComponentProps['form'] & { submit: () => void }) => void);
}

export const FormInputRender: React.FC<{
  item: ProColumns<any>;
  value?: any;
  form?: FormComponentProps['form'];
  type: ProTableTypes;
  intl: IntlType;
  onChange?: (value: any) => void;
  onSelect?: (value: any) => void;
}> = (props) => {
  const { item, intl, form, type, ...rest } = props;
  const { valueType: itemValueType } = item;
  // if function， run it
  const valueType = typeof itemValueType === 'function' ? itemValueType({}) : itemValueType;
  /**
   * 自定义 render
   */
  if (item.renderFormItem) {
    /**
     *删除 renderFormItem 防止重复的 dom 渲染
     */
    const { renderFormItem, ...restItem } = item;
    const defaultRender = (newItem: ProColumns<any>) => (
      <FormInputRender
        {...({
          ...props,
          item: newItem,
        } || null)}
      />
    );

    // 自动注入 onChange 和 value,用户自己很有肯能忘记
    const dom = renderFormItem(
      restItem,
      { ...rest, type, defaultRender },
      form as any,
    ) as React.ReactElement;
    // 有可能不是不是一个组件
    if (!React.isValidElement(dom)) {
      return dom;
    }
    const defaultProps = dom.props as any;
    // 已用户的为主，不然过于 magic
    return React.cloneElement(dom, { ...rest, ...defaultProps });
  }

  if (!valueType || valueType === 'text') {
    const { valueEnum } = item;
    if (valueEnum) {
      return (
        <Select
          allowClear
          placeholder={intl.getMessage('tableForm.selectPlaceholder', '请选择')}
          {...rest}
          {...item.formItemProps}
        >
          {parsingValueEnumToArray(ObjToMap(valueEnum)).map(({ value, text }) => (
            <Select.Option key={value} value={value}>
              {text}
            </Select.Option>
          ))}
        </Select>
      );
    }
    return (
      <Input
        placeholder={intl.getMessage('tableForm.inputPlaceholder', '请输入')}
        {...rest}
        {...item.formItemProps}
      />
    );
  }
  if (valueType === 'date') {
    return (
      <DatePicker
        placeholder={intl.getMessage('tableForm.selectPlaceholder', '请选择')}
        style={{
          width: '100%',
        }}
        {...rest}
        {...item.formItemProps}
      />
    );
  }

  if (valueType === 'dateTime') {
    return (
      <DatePicker
        showTime
        placeholder={intl.getMessage('tableForm.selectPlaceholder', '请选择')}
        style={{
          width: '100%',
        }}
        {...rest}
        {...item.formItemProps}
      />
    );
  }

  if (valueType === 'dateRange') {
    return (
      <DatePicker.RangePicker
        placeholder={[
          intl.getMessage('tableForm.selectPlaceholder', '请选择'),
          intl.getMessage('tableForm.selectPlaceholder', '请选择'),
        ]}
        style={{
          width: '100%',
        }}
        {...rest}
        {...item.formItemProps}
      />
    );
  }
  if (valueType === 'dateTimeRange') {
    return (
      <DatePicker.RangePicker
        showTime
        placeholder={[
          intl.getMessage('tableForm.selectPlaceholder', '请选择'),
          intl.getMessage('tableForm.selectPlaceholder', '请选择'),
        ]}
        style={{
          width: '100%',
        }}
        {...rest}
        {...item.formItemProps}
      />
    );
  }

  if (valueType === 'time') {
    return (
      <TimePicker
        placeholder={intl.getMessage('tableForm.selectPlaceholder', '请选择')}
        style={{
          width: '100%',
        }}
        {...rest}
        {...item.formItemProps}
      />
    );
  }
  if (valueType === 'digit') {
    return (
      <InputNumber
        placeholder={intl.getMessage('tableForm.inputPlaceholder', '请输入')}
        style={{
          width: '100%',
        }}
        {...rest}
        {...item.formItemProps}
      />
    );
  }
  if (valueType === 'money') {
    return (
      <InputNumber
        min={0}
        precision={2}
        formatter={(value) => {
          if (value) {
            return `${intl.getMessage('moneySymbol', '￥')} ${value}`.replace(
              /\B(?=(\d{3})+(?!\d))/g,
              ',',
            );
          }
          return '';
        }}
        parser={(value) =>
          value
            ? value.replace(
                new RegExp(`\\${intl.getMessage('moneySymbol', '￥')}\\s?|(,*)`, 'g'),
                '',
              )
            : ''
        }
        placeholder={intl.getMessage('tableForm.inputPlaceholder', '请输入')}
        style={{
          width: '100%',
        }}
        {...rest}
        {...item.formItemProps}
      />
    );
  }
  if (valueType === 'textarea' && type === 'form') {
    return (
      <Input.TextArea
        placeholder={intl.getMessage('tableForm.inputPlaceholder', '请输入')}
        {...rest}
        {...item.formItemProps}
      />
    );
  }
  return (
    <Input
      placeholder={intl.getMessage('tableForm.inputPlaceholder', '请输入')}
      {...rest}
      {...item.formItemProps}
    />
  );
};

export const proFormItemRender: (props: {
  item: ProColumns<any>;
  isForm: boolean;
  type: ProTableTypes;
  intl: IntlType;
  formInstance?: FormComponentProps['form'];
  colConfig:
    | {
        lg: number;
        md: number;
        xxl: number;
        xl: number;
        sm: number;
        xs: number;
      }
    | {
        span: number;
      }
    | undefined;
}) => null | JSX.Element = ({ item, intl, formInstance, type, isForm, colConfig }) => {
  const {
    valueType,
    dataIndex,
    valueEnum,
    renderFormItem,
    render,
    hideInForm,
    hideInSearch,
    hideInTable,
    renderText,
    order,
    initialValue,
    ellipsis,
    formItemProps,
    index,
    ...rest
  } = item;
  const key = genColumnKey(rest.key, dataIndex, index);
  const dom = <FormInputRender item={item} type={type} intl={intl} form={formInstance} />;
  if (!dom) {
    return null;
  }

  // 支持 function 的 title
  const getTitle = () => {
    if (rest.title && typeof rest.title === 'function') {
      return rest.title(item, 'form');
    }
    return rest.title;
  };
  return (
    <Col {...colConfig} key={key}>
      <Form.Item labelAlign="right" label={getTitle()}>
        {formInstance?.getFieldDecorator(key, { ...(isForm ? (rest as any) : {}) })(dom)}
      </Form.Item>
    </Col>
  );
};

const dateFormatterMap = {
  time: 'HH:mm:ss',
  date: 'YYYY-MM-DD',
  dateTime: 'YYYY-MM-DD HH:mm:ss',
  dateRange: 'YYYY-MM-DD',
  dateTimeRange: 'YYYY-MM-DD HH:mm:ss',
};

/**
 * 判断 DataType 是不是日期类型
 * @param type
 */
const isDateValueType = (type: ProColumnsValueType | ProColumnsValueTypeFunction<any>) => {
  let valueType: ProColumnsValueType = type as ProColumnsValueType;
  if (typeof type === 'function') {
    // 如果是 object 说明是进度条，直接返回 false
    if (typeof type({}) === 'object') {
      return false;
    }
    valueType = type({}) as ProColumnsValueType;
  }
  const dateTypes = ['date', 'dateRange', 'dateTimeRange', 'dateTime', 'time'];
  return dateTypes.includes(valueType);
};

/**
 * 这里主要是来转化一下数据
 * 将 moment 转化为 string
 * 将 all 默认删除
 * @param value
 * @param dateFormatter
 * @param proColumnsMap
 */
const conversionValue = (
  value: any,
  dateFormatter: string | boolean,
  proColumnsMap: { [key: string]: ProColumns<any> },
) => {
  const tmpValue = {};

  Object.keys(value).forEach((key) => {
    const column = proColumnsMap[key || 'null'] || {};
    const valueType = column.valueType || 'text';
    const itemValue = value[key];

    // 如果值是 "all"，或者不存在直接删除
    // 下拉框里选 all，会删除
    if (itemValue === undefined || (itemValue === 'all' && column.valueEnum)) {
      return;
    }

    // 如果是日期，再处理这些
    if (!isDateValueType(valueType)) {
      tmpValue[key] = itemValue;
      return;
    }

    // 如果是 moment 的对象的处理方式
    // 如果执行到这里，肯定是 ['date', 'dateRange', 'dateTimeRange', 'dateTime', 'time'] 之一
    if (moment.isMoment(itemValue) && dateFormatter) {
      if (dateFormatter === 'string') {
        const formatString = dateFormatterMap[valueType as 'dateTime'];
        tmpValue[key] = (itemValue as Moment).format(formatString || 'YYYY-MM-DD HH:mm:ss');
        return;
      }
      if (dateFormatter === 'number') {
        tmpValue[key] = (itemValue as Moment).valueOf();
        return;
      }
    }

    // 这里是日期数组
    if (Array.isArray(itemValue) && itemValue.length === 2 && dateFormatter) {
      if (dateFormatter === 'string') {
        const formatString = dateFormatterMap[valueType as 'dateTime'];
        const [startValue, endValue] = itemValue;
        tmpValue[key] = [
          moment(startValue as Moment).format(formatString || 'YYYY-MM-DD HH:mm:ss'),
          moment(endValue as Moment).format(formatString || 'YYYY-MM-DD HH:mm:ss'),
        ];
        return;
      }
      if (dateFormatter === 'number') {
        const [startValue, endValue] = itemValue;
        tmpValue[key] = [
          moment(startValue as Moment).valueOf(),
          moment(endValue as Moment).valueOf(),
        ];
      }
    }

    // 都没命中，原样返回
    tmpValue[key] = itemValue;
  });
  return tmpValue;
};

const getDefaultSearch = (
  search: boolean | SearchConfig | undefined,
  intl: IntlType,
  isForm: boolean,
): SearchConfig => {
  const config = {
    collapseRender: (collapsed: boolean) => {
      if (collapsed) {
        return (
          <>
            {intl.getMessage('tableForm.collapsed', '展开')}
            <DownOutlined
              style={{
                marginLeft: '0.5em',
                transition: '0.3s all',
                transform: `rotate(${collapsed ? 0 : 0.5}turn)`,
              }}
            />
          </>
        );
      }
      return (
        <>
          {intl.getMessage('tableForm.expand', '收起')}
          <DownOutlined
            style={{
              marginLeft: '0.5em',
              transition: '0.3s all',
              transform: `rotate(${collapsed ? 0 : 0.5}turn)`,
            }}
          />
        </>
      );
    },
    searchText: intl.getMessage('tableForm.search', defaultSearch.searchText || '查询'),
    resetText: intl.getMessage('tableForm.reset', defaultSearch.resetText || '重置'),
    submitText: intl.getMessage('tableForm.submit', defaultSearch.submitText || '提交'),
    span: isForm ? defaultFormColConfig : defaultColConfig,
  };

  if (search === undefined || search === true) {
    return config;
  }

  return { ...config, ...search } as Required<SearchConfig>;
};

/**
 * 合并用户和默认的配置
 * @param span
 * @param size
 */
const getSpanConfig = (
  span: number | typeof defaultColConfig,
  size: keyof typeof defaultColConfig,
): number => {
  if (typeof span === 'number') {
    return span;
  }
  const config = {
    ...defaultColConfig,
    ...span,
  };
  return config[size];
};

const FormSearch = <T, U = {}>({
  onSubmit,
  formRef,
  dateFormatter = 'string',
  search: propsSearch,
  type,
  form,
  formConfig = {},
  onReset,
}: TableFormItem<T>) => {
  /**
   * 为了支持 dom 的消失，支持了这个 api
   */
  const intl = useIntl();

  const searchConfig = getDefaultSearch(propsSearch, intl, type === 'form');
  const { span } = searchConfig;

  const counter = Container.useContainer();
  const [collapse, setCollapse] = useMergeValue<boolean>(true, {
    value: searchConfig.collapsed,
    onChange: searchConfig.onCollapse,
  });
  const [proColumnsMap, setProColumnsMap] = useState<{
    [key: string]: ProColumns<any>;
  }>({});

  const windowSize = useMediaQuery();
  const [colSize, setColSize] = useState(getSpanConfig(span || 8, windowSize));
  const [formHeight, setFormHeight] = useState<number | undefined>(88);
  const rowNumber = 24 / colSize || 3;

  const isForm = type === 'form';

  /**
   *提交表单，根据两种模式不同，方法不相同
   */
  const submit = async () => {
    // 如果不是表单模式，不用进行验证
    if (!isForm) {
      const value = form.getFieldsValue();
      if (onSubmit) {
        onSubmit(conversionValue(value, dateFormatter, proColumnsMap) as T);
      }
      return;
    }
    try {
      form.validateFields((error, values) => {
        if (onSubmit && !error) {
          onSubmit(conversionValue(values, dateFormatter, proColumnsMap) as T);
        }
      });
    } catch (error) {
      // console.log(error)
    }
  };

  useEffect(() => {
    if (!formRef) {
      return;
    }
    if (typeof formRef === 'function') {
      formRef({
        ...form,
        submit,
      });
    }
    if (formRef && typeof formRef !== 'function') {
      // eslint-disable-next-line no-param-reassign
      formRef.current = {
        ...form,
        submit,
      };
    }
  }, []);

  useEffect(() => {
    setColSize(getSpanConfig(span || 8, windowSize));
  }, [windowSize]);

  useDeepCompareEffect(() => {
    const tempMap = {};
    counter.proColumns.forEach((item) => {
      tempMap[genColumnKey(item.key, item.dataIndex, item.index) || 'null'] = item;
    });
    setProColumnsMap(tempMap);
  }, [counter.proColumns]);

  const columnsList = counter.proColumns
    .filter((item) => {
      const { valueType } = item;
      if (item.hideInSearch && type !== 'form') {
        return false;
      }
      if (type === 'form' && item.hideInForm) {
        return false;
      }
      if (
        valueType !== 'index' &&
        valueType !== 'indexBorder' &&
        valueType !== 'option' &&
        (item.key || item.dataIndex)
      ) {
        return true;
      }
      return false;
    })
    .sort((a, b) => {
      if (a && b) {
        return (b.order || 0) - (a.order || 0);
      }
      if (a && a.order) {
        return -1;
      }
      if (b && b.order) {
        return 1;
      }
      return 0;
    });

  const colConfig = typeof span === 'number' ? { span } : span;

  const domList = columnsList
    .map((item) =>
      proFormItemRender({
        isForm,
        formInstance: form,
        item,
        type,
        colConfig,
        intl,
      }),
    )
    .filter((_, index) => (collapse && type !== 'form' ? index < (rowNumber - 1 || 1) : true))
    .filter((item) => !!item);

  return (
    <ConfigConsumer>
      {({ getPrefixCls }: ConfigConsumerProps) => {
        const className = getPrefixCls('pro-table-search');
        const formClassName = getPrefixCls('pro-table-form');
        return (
          <div
            className={classNames(className, {
              [formClassName]: isForm,
            })}
            style={
              isForm
                ? undefined
                : {
                    height: formHeight,
                  }
            }
          >
            <RcResizeObserver
              onResize={({ height }) => {
                if (type === 'form') {
                  return;
                }
                setFormHeight(height + 24);
              }}
            >
              <div>
                <Form {...formConfig} form={form}>
                  <Row gutter={16} justify="start">
                    {domList}
                    <Col
                      {...colConfig}
                      offset={getOffset(domList.length, colSize)}
                      key="option"
                      className={classNames(`${className}-option`, {
                        [`${className}-form-option`]: isForm,
                      })}
                    >
                      <Form.Item
                        label={isForm && ' '}
                        style={{
                          padding: '4px 0',
                        }}
                      >
                        <FormOption
                          showCollapseButton={columnsList.length > rowNumber - 1 && !isForm}
                          searchConfig={searchConfig}
                          submit={submit}
                          onReset={onReset}
                          form={{
                            ...form,
                            submit,
                          }}
                          type={type}
                          collapse={collapse}
                          setCollapse={setCollapse}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </div>
            </RcResizeObserver>
          </div>
        );
      }}
    </ConfigConsumer>
  );
};

export default Form.create<TableFormItem<any>>()(FormSearch);
