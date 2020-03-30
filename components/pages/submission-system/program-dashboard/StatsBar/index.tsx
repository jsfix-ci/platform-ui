import Container from 'uikit/Container';
import { css, keyframes } from '@emotion/core';
import { Row, Col } from 'react-grid-system';
import styled from '@emotion/styled-base';
import Typography from 'uikit/Typography';
import useTheme from 'uikit/utils/useTheme';
import Button from 'uikit/Button';
import Icon from 'uikit/Icon';
import DASHBOARD_SUMMARY_QUERY from './DASHBOARD_SUMMARY_QUERY.gql';
import { useQuery } from '@apollo/react-hooks';
import { usePageQuery } from 'global/hooks/usePageContext';
import _ from 'lodash';

const StatDesc = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding-left: 8px;
  padding-right: 8px;
  height: 100%;
  justify-content: space-between;
`;

const PercentBar: React.ComponentType<{ num: number; den: number; fillColor?: string }> = ({
  num,
  den,
  fillColor,
}) => {
  const theme = useTheme();

  // Negative Numbers should be zero, percentages over 100 should be capped
  num < 0 ? (num = 0) : { num };
  den <= 0 ? (den = 1) : { den };
  const fraction = Math.min((num / den) * 100, 100);
  const fill_amount = `${fraction}%`;

  // Animation
  const grow = keyframes`
    0% {
      width: 0%;
    }

    100% {
      width: ${fill_amount};
    }
   `;

  return (
    <div
      css={css`
        padding-bottom: 10px;
      `}
    >
      <div
        css={css`
          background-color: ${theme.colors.grey_2};
          border-radius: 8px;
          width: 120px;
        `}
      >
        <div
          css={css`
            background-color: ${theme.colors[fillColor] || fillColor || theme.colors.secondary};
            width: ${fill_amount};
            height: 6px;
            border-radius: 8px;
            animation-name: ${grow};
            animation-duration: 1s;
            transition: width 2s ease-in-out;
          `}
        />
      </div>
    </div>
  );
};

const Statistic: React.ComponentType<{ quantity: String; description: String }> = ({
  children,
  quantity,
  description,
}) => (
  <StatDesc>
    {/* Div for Quantity */}
    <div>
      <div
        css={css`
          height: 30px;
          padding-bottom: 4px;
        `}
      >
        <Typography variant="title">{quantity}</Typography>
      </div>
      {/* Div for Description */}
      <div
        css={css`
          padding-bottom: 8px;
          min-width: 120px;
        `}
      >
        <Typography color="grey" variant="caption">
          {description}
        </Typography>
      </div>
    </div>

    <div
      css={css`
        padding-bottom: 10px;
      `}
    >
      {children}
    </div>
  </StatDesc>
);

export default () => {
  const { shortName: programShortName } = usePageQuery<{ shortName: string }>();
  const { data, loading } = useQuery(DASHBOARD_SUMMARY_QUERY, {
    variables: { programShortName: programShortName },
  });
  return (
    <div>
      <Container>
        <Row justify="around">
          <Col>
            {!loading ? (
              <Statistic
                quantity={data.programDonorSummaryStats.registeredDonorsCount.toString()}
                description="Registered Donors"
              >
                <PercentBar
                  num={data.programDonorSummaryStats.registeredDonorsCount}
                  den={data.program.commitmentDonors}
                  fillColor="warning"
                />
              </Statistic>
            ) : (
              <Statistic quantity="..." description="Registered Donors">
                <PercentBar num={0} den={100} fillColor="warning" />
              </Statistic>
            )}
          </Col>
          <Col>
            {!loading ? (
              <Statistic
                quantity={(data.programDonorSummaryStats.percentageCoreClinical * 100)
                  .toString()
                  .concat('%')}
                description="Donors with all Core Clinical Data"
              >
                <PercentBar
                  num={data.programDonorSummaryStats.percentageCoreClinical * 100}
                  den={100}
                  fillColor="warning"
                />
              </Statistic>
            ) : (
              <Statistic quantity="..." description="Donors with all Core Clinical Data">
                <PercentBar num={0} den={100} fillColor="warning" />
              </Statistic>
            )}
          </Col>
          <Col>
            {!loading ? (
              <Statistic
                quantity={(data.programDonorSummaryStats.percentageTumourAndNormal * 100)
                  .toString()
                  .concat('%')}
                description="Donors with Tumour & Normal"
              >
                <PercentBar
                  num={data.programDonorSummaryStats.percentageTumourAndNormal * 100}
                  den={100}
                  fillColor="warning"
                />
              </Statistic>
            ) : (
              <Statistic quantity="..." description="Donors with Tumour & Normal">
                <PercentBar num={0} den={100} fillColor="warning" />
              </Statistic>
            )}
          </Col>
          <Col>
            {!loading ? (
              <Statistic
                quantity={data.programDonorSummaryStats.donorsProcessingMolecularDataCount.toString()}
                description="Donors in Molecular Data Processing"
              />
            ) : (
              <Statistic quantity="..." description="Donors in Molecular Data Processing" />
            )}
          </Col>
          <Col>
            {!loading ? (
              <Statistic
                quantity={data.programDonorSummaryStats.filesToQcCount.toString()}
                description="Files to QC"
              >
                <Button variant="text">
                  <Icon
                    css={css`
                      padding-right: 4px;
                    `}
                    name="download"
                    height="12px"
                  />
                  Manifest
                </Button>
              </Statistic>
            ) : (
              <Statistic quantity="..." description="Files to QC">
                <Button variant="text" disabled>
                  <Icon
                    css={css`
                      padding-right: 4px;
                    `}
                    name="download"
                    fill="grey_2"
                    height="12px"
                  />
                  Manifest
                </Button>
              </Statistic>
            )}
          </Col>
          <Col>
            {!loading ? (
              <Statistic
                quantity={data.programDonorSummaryStats.donorsWithReleasedFilesCount.toString()}
                description="Donors with Released Files"
              >
                <PercentBar
                  num={data.programDonorSummaryStats.donorsWithReleasedFilesCount}
                  den={data.programDonorSummaryStats.registeredDonorsCount}
                  fillColor="warning"
                />
              </Statistic>
            ) : (
              <Statistic quantity="..." description="Donors with Released Files">
                <PercentBar num={0} den={100} fillColor="warning" />
              </Statistic>
            )}
          </Col>
          <Col>
            {!loading ? (
              <Statistic
                quantity={data.programDonorSummaryStats.allFilesCount.toString()}
                description="All Files"
              >
                <Button variant="text">
                  <Icon
                    css={css`
                      padding-right: 4px;
                    `}
                    name="download"
                    height="12px"
                  />
                  Manifest
                </Button>
              </Statistic>
            ) : (
              <Statistic quantity="..." description="All Files">
                <Button variant="text" disabled>
                  <Icon
                    css={css`
                      padding-right: 4px;
                    `}
                    name="download"
                    fill="grey_2"
                    height="12px"
                  />
                  Manifest
                </Button>
              </Statistic>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};
