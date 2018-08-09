import { pxToRem } from '../../../../lib'

export default {
  root: ({ props, variables }) => ({
    display: 'inline-block',
    verticalAlign: 'middle',
    width: (props.fluid && '100%') || variables.width,
    height: variables.height || 'auto',
    ...(props.circular && { borderRadius: pxToRem(9999) }),
    ...(props.avatar && {
      width: (props.fluid && '100%') || variables.avatarSize,
      borderRadius: variables.avatarRadius,
    }),
  }),
}
