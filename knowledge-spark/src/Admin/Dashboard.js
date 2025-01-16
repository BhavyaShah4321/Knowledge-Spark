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
        <div className="dashboard-container">
            <Row className="dashboard-widget-row" gutter={24}>
                <Col xs={24} sm={12} lg={6}>
                    <div className="dashboard-graph-widget">
                        <div className="dashboard-icon-container">
                            <Graphico />
                        </div>
                        <div className="graphico-details">
                            <h3>$50,000</h3>
                            <p>Total Teacher</p>
                        </div>
                        <div className="dashboard-percentage">+16%</div>
                    </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <div className="dashboard-graph-widget">
                        <div className="dashboard-icon-container">
                            <Graphico />
                        </div>
                        <div className="graphico-details">
                            <h3>$50,000</h3>
                            <p>Total Student</p>
                        </div>
                        <div className="dashboard-percentage">+16%</div>
                    </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <div className="dashboard-graph-widget">
                        <div className="dashboard-icon-container">
                            <Graphico />
                        </div>
                        <div className="graphico-details">
                            <h3>$50,000</h3>
                            <p>Total Commision</p>
                        </div>
                        <div className="dashboard-percentage">+16%</div>
                    </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <div className="dashboard-graph-widget">
                        <div className="dashboard-icon-container">
                            <Graphico />
                        </div>
                        <div className="graphico-details">
                            <h3>$50,000</h3>
                            <p>Total Courses</p>
                        </div>
                        <div className="dashboard-percentage">+16%</div>
                    </div>
                </Col>
            </Row>
            <Row className="dashboard-main-content" gutter={24}>
                <Col xs={24} sm={16}>
                    <div className="dashboard-chart-wrapper">
                        <div className="dashboard-header">
                            <h3>Overview</h3>
                            <div className="dashboard-date-range">
                                <label>Select Date Range:</label>
                                <RangePicker
                                    defaultValue={[dayjs('2015/01/01', dateFormat), dayjs('2015/01/01', dateFormat)]}
                                    format={dateFormat}
                                />
                                <Button type="primary" size="small">GO</Button>
                            </div>
                        </div>
                        <Graph1 />
                    </div>
                </Col>
                <Col xs={24} sm={8}>
                    {["Sale", "Purchase", "Profit/Loss"].map((title, index) => (
                        <div className="dashboard-info-box" key={index}>
                            <div className="dashboard-box-header">
                                <h4>{title}</h4>
                                <Select
                                    defaultValue="Last 365 day"
                                    style={{ width: 120 }}
                                    options={[
                                        { value: 'Last 365 day', label: 'Last 365 day' },
                                    ]}
                                />
                            </div>
                            {index < 2 ? (
                                <Row gutter={16}>
                                    {["Invoices", "Paid", "Balance"].map((text, idx) => (
                                        <Col xs={8} key={idx}>
                                            <div className={`dashboard-info-box-item ${text.toLowerCase()}`}>
                                                <div className="dot"></div>
                                                <h3>${50_000 * (idx + 1)}</h3>
                                                <p>{text}</p>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            ) : (
                                <>
                                    <div className="dashboard-profit-details">
                                        <h3>$250,000</h3>
                                        <p>Gross Profit</p>
                                    </div>
                                    <Row gutter={16}>
                                        <Col xs={24}>
                                            <div className="dashboard-profit green">
                                                <div className="dot"></div>
                                                <div>
                                                    <h3>$50,000</h3>
                                                    <p>10 Bills</p>
                                                </div>
                                                <Slider defaultValue={30} disabled={disabled} />
                                            </div>
                                        </Col>
                                        <Col xs={24}>
                                            <div className="dashboard-profit red">
                                                <div className="dot"></div>
                                                <div>
                                                    <h3>$2,356,800</h3>
                                                    <p>Paid</p>
                                                </div>
                                                <Slider defaultValue={70} disabled={disabled} />
                                            </div>
                                        </Col>
                                    </Row>
                                </>
                            )}
                        </div>
                    ))}
                </Col>
            </Row>
        </div>
    );
}

export default Dashboard;
