const createResolver = (resolver) => {
  const baseResolver = resolver;
  baseResolver.createResolver = (childResolver) => {
    const newResolver = async (parent, args, context, info) => {
      await resolver(parent, args, context, info);
      return childResolver(parent, args, context, info);
    };
    return createResolver(newResolver);
  };
  return baseResolver;
};

// requiresAuth
export default createResolver((parent, args, { user }) => {
  if (!user || !user.id) {
    throw new Error('Not authenticated');
  }
});

export const requiresTeamAccess = createResolver(async (parent, { channelId }, { user, models }) => {
  if (!user || !user.id) {
    throw new Error('Not authenticated');
  }
  const channel = await models.Channel.findOne({ where: { id: channelId } });
  // Check if you are a member of the team
  const member = await models.Member.findOne({
    where: { teamId: channel.teamId, userId: user.id },
  });
  if (!member) {
    throw new Error("You have to be a member of the team to subcribe to it's messages");
  }
});
