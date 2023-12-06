import { Box, Flex, Typography } from '@strapi/design-system';
import { pxToRem } from '@strapi/helper-plugin';

// @ts-expect-error – Types will be done when we merge https://github.com/strapi/strapi/pull/18984
import { STAGE_COLOR_DEFAULT } from '../../../../pages/SettingsPage/pages/ReviewWorkflows/constants';
// @ts-expect-error – Types will be done when we merge https://github.com/strapi/strapi/pull/18984
import { getStageColorByHex } from '../../../../pages/SettingsPage/pages/ReviewWorkflows/utils/colors';

interface ReviewWorkflowsStageEEProps {
  color?: string;
  name: string;
}

const ReviewWorkflowsStageEE = ({
  color = STAGE_COLOR_DEFAULT,
  name,
}: ReviewWorkflowsStageEEProps) => {
  const { themeColorName } = getStageColorByHex(color);

  return (
    <Flex alignItems="center" gap={2} maxWidth={pxToRem(300)}>
      <Box
        height={2}
        background={color}
        borderColor={themeColorName === 'neutral0' ? 'neutral150' : undefined}
        hasRadius
        shrink={0}
        width={2}
      />

      <Typography fontWeight="regular" textColor="neutral700" ellipsis>
        {name}
      </Typography>
    </Flex>
  );
};

export { ReviewWorkflowsStageEE };
export type { ReviewWorkflowsStageEEProps };
