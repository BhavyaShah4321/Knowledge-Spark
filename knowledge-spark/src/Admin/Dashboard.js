import { Button, Col, DatePicker, Row, Select, Slider } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { useState } from 'react';
import { ReactComponent as Graphico } from '../../src/Image/graphico.svg';
import Graph1 from "./Graph1";
dayjs.extend(customParseFormat);
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY/MM/DD';

function Dashboard() {
    const [disabled, setDisabled] = useState(false);

    return (
        <>
      <Row className='widgetrow' gutter={24}>
        <Col xs={24} sm={12} lg={6}>
          <div className='dwidget'>
            <div className='icond'>
              <Graphico />
            </div>
            <div className='count'><h3>$50,000</h3><p>Today's Money</p></div>
            <div className='percent'>
              +16%
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className='dwidget'>
            <div className='icond'>
              <Graphico />
            </div>
            <div className='count'><h3>$50,000</h3><p>Today's Money</p></div>
            <div className='percent'>
              +16%
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className='dwidget'>
            <div className='icond'>
              <Graphico />
            </div>
            <div className='count'><h3>$50,000</h3><p>Today's Money</p></div>
            <div className='percent'>
              +16%
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className='dwidget'>
            <div className='icond'>
              <Graphico />
            </div>
            <div className='count'><h3>$50,000</h3><p>Today's Money</p></div>
            <div className='percent'>
              +16%
            </div>
          </div>
        </Col>
      </Row>
      <Row className='graphrow' gutter={24}>
        <Col xs={24} sm={12} lg={16}>
          <div className='chartwrap' >
            <div className='titled'>
              Overview
              <div className='daterangewrap'>
                <label>Select Date Range:</label>
                <RangePicker
                  defaultValue={[dayjs('2015/01/01', dateFormat), dayjs('2015/01/01', dateFormat)]}
                  format={dateFormat}
                />
                <Button
                  type="primary"
                  size='small'
                  htmlType="submit"
                >
                  GO
                </Button>
              </div>
            </div>

            <Graph1 />

          </div>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <div className='boxdiv'>
            <div className='titled'>
              Sale <Select
                defaultValue="Last 365 day"
                style={{
                  width: 120,
                }}

                options={[
                  {
                    value: 'Last 365 day',
                    label: 'Last 365 day',
                  },
                ]}
              />
            </div>
            <Row gutter={16}>
              <Col xs={24} sm={8} >
                <div className='inrbox invoice'>
                  <div className='dot'></div>
                  <h3>$50,000</h3>
                  <p>50 Invoices</p>
                </div>
              </Col>
              <Col xs={24} sm={8} >
                <div className='inrbox paid'>
                  <div className='dot'></div>
                  <h3>$2356800</h3>
                  <p>Paid</p>
                </div>
              </Col>
              <Col xs={24} sm={8} >
                <div className='inrbox balance'>
                  <div className='dot'></div>
                  <h3>$8796543</h3>
                  <p>Balance</p>
                </div>
              </Col>
            </Row>
          </div>
          <div className='boxdiv'>
            <div className='titled'>
              Purchase <Select
                defaultValue="Last 365 day"
                style={{
                  width: 120,
                }}

                options={[
                  {
                    value: 'Last 365 day',
                    label: 'Last 365 day',
                  },
                ]}
              />
            </div>
            <Row gutter={16}>
              <Col xs={24} sm={8} >
                <div className='inrbox invoice'>
                  <div className='dot'></div>
                  <h3>$50,000</h3>
                  <p>10 Bills</p>
                </div>
              </Col>
              <Col xs={24} sm={8} >
                <div className='inrbox paid'>
                  <div className='dot'></div>
                  <h3>$2356800</h3>
                  <p>Paid</p>
                </div>
              </Col>
              <Col xs={24} sm={8} >
                <div className='inrbox balance'>
                  <div className='dot'></div>
                  <h3>$8796543</h3>
                  <p>Balance</p>
                </div>
              </Col>
            </Row>
          </div>
          <div className='boxdiv'>
            <div className='titled'>
              Profit/Loss <Select
                defaultValue="Last 365 day"
                style={{
                  width: 120,
                }}

                options={[
                  {
                    value: 'Last 365 day',
                    label: 'Last 365 day',
                  },
                ]}
              />
            </div>
            <div className='subtitle'>
              <h3>$250,000</h3>
              <p>Gross Profit</p>
            </div>
            <Row gutter={16}>
              <Col xs={24}  >
                <div className='inrprofit green mb-4 '>
                  <div className='dot'></div>
                  <div>
                    <h3>$50,000</h3>
                    <p>10 Bills</p>
                  </div>
                  <div className='sliderwrp'><Slider defaultValue={30} disabled={disabled} /></div>
                </div>
              </Col>
              <Col xs={24}  >
                <div className='inrprofit red'>
                  <div className='dot'></div>
                  <div>
                    <h3>$2356800</h3>
                    <p>Paid</p>
                  </div>
                  <div className='sliderwrp'><Slider defaultValue={30} disabled={disabled} /></div>
                </div>
              </Col>

            </Row>
          </div>
        </Col>
      </Row>
    </>

        
      
    );
}

export default Dashboard;
